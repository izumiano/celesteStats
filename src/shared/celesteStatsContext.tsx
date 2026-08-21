import { logError, trace } from "@izumiano/vite-logger";
import {
	createContext,
	useCallback,
	useContext,
	useState,
	type ReactNode,
} from "react";
import { toast } from "react-toastify";
import localData from "../localData";
import {
	getNodePath,
	sortNodes,
	type NodeStats,
	type SaveData,
} from "../statsPage/nodeTypes";
import { joinElems, tryCatch } from "../utils";

interface MapAttributesResponse {
	Completed: "true" | "false";
	TimePlayed: string;
	ClearTime: number | null;
	Deaths: string;
	ClearDeaths: number | null;
	ClearDate: number | null;
	StrawberryCount: number | null;
	TotalStrawberries: string;
	BestDashes: string;
	BestDeaths: string;
	BestFullClearTime: string;
	BestTime: string;
	FullClear: "true" | "false";
	HeartGem: "true" | "false";
	SingleRunCompleted: "true" | "false";
}

type ModesType =
	| { "@attributes": MapAttributesResponse }[]
	| { [key: number]: { "@attributes": MapAttributesResponse } };

interface ChapterStatsResponse {
	sid: string;
	modes: ModesType;
}

type LevelSetStatsResponse = {
	[key: string]: LevelSetStatsResponse | ChapterStatsResponse;
};

interface SaveDataResponse {
	levelSetStats: LevelSetStatsResponse;
	timestamp: number;
}

function modeNumberToTitle(mode: number) {
	switch (mode) {
		case 0:
			return "A-Side";
		case 1:
			return "B-Side";
		case 2:
			return "C-Side";
		default:
			logError(`Unknown mode: ${mode}`);
			return `${mode}`;
	}
}

function recurseNodes(
	stats: LevelSetStatsResponse,
	filter: StatsFilter,
): { failed: false; value: NodeStats } | { failed: true; error: unknown } {
	return tryCatch(() => _recurseNodesImpl(stats, filter));
}

function isModeArray(
	stats: ChapterStatsResponse | LevelSetStatsResponse,
): stats is {
	sid: string;
	modes: ModesType;
} {
	if (typeof stats.sid !== "string") {
		return false;
	}

	if (Array.isArray(stats.modes)) {
		return true;
	}

	const modeKeys = Object.keys(stats.modes);

	const attrKeys = Object.keys(
		stats.modes[modeKeys[0] as keyof typeof stats.modes],
	);

	const hasAttr = attrKeys.some((key) => key === "@attributes");
	const allInt = !modeKeys.some((key) => {
		const num = parseInt(key);
		return (
			!Number.isNaN(num) && Number.isInteger(num) && num !== parseFloat(key)
		);
	});

	return hasAttr && allInt;
}

function _recurseNodesImpl(
	stats: ChapterStatsResponse | LevelSetStatsResponse,
	filter: StatsFilter,
	parent: NodeStats | null = null,
	title: string | null = null,
) {
	const nodeStats: NodeStats = {
		children: [],
		parent,

		isMode: false,
		isChapter: false,

		title: title ?? "Unknown",
		completed: true,
		hasAnyCompleted: false,

		timePlayed: 0,
		clearTime: 0,
		deaths: 0,
		clearDeaths: 0,

		clearDate: null,
		strawberryCount: 0,
		totalStrawberries: 0,
		bestDashes: 0,
		bestDeaths: 0,
		bestFullClearTime: 0,
		bestTime: 0,
		fullClear: true,
		heartGem: true,
		singleRunCompleted: true,
	};

	if (isModeArray(stats)) {
		if (parent) {
			nodeStats.sid = stats.sid;
		}
		const modesStats = stats.modes;

		const entries = Object.entries(modesStats) as unknown as [
			number | string,
			{
				"@attributes": MapAttributesResponse;
			},
		][];

		const pushToNodeStats =
			// biome-ignore lint/suspicious/noDoubleEquals: <intentionally coercing string(0) to number(0) to show sides with modeNumber >0 >
			entries.length > 1 || !entries.some((e) => e[0] == 0);

		for (const [key, stat] of entries) {
			const attr = stat["@attributes"];

			const node = statAttributesToNode(attr, key, nodeStats, !pushToNodeStats);
			handleNodeStats(nodeStats, node, filter, pushToNodeStats);
		}
	} else {
		for (const [title, stat] of Object.entries(stats)) {
			const node = _recurseNodesImpl(stat, filter, nodeStats, title);
			node.isChapter = node.children[0]?.isMode ?? true;

			handleNodeStats(nodeStats, node, filter);
		}
	}

	if (filter.layoutType === "campaigns") {
		sortNodes(nodeStats.children, filter);
	}
	return nodeStats;
}

function handleNodeStats(
	nodeStats: NodeStats,
	node: NodeStats,
	filter: StatsFilter,
	pushToNodeStats = true,
) {
	if (node.completed) {
		nodeStats.hasAnyCompleted = true;
		if (!filter.showCleared) {
			return;
		}
	} else {
		nodeStats.completed = false;
		if (!filter.showUncleared) {
			return;
		}
	}

	if (pushToNodeStats) {
		nodeStats.children.push(node);
	}

	nodeStats.timePlayed += node.timePlayed;
	nodeStats.clearTime += node.clearTime;
	nodeStats.clearDeaths += node.clearDeaths;
	nodeStats.deaths += node.deaths;

	if (
		nodeStats.clearDate == null ||
		nodeStats.clearDate < (node.clearDate ?? 0)
	) {
		nodeStats.clearDate = node.clearDate;
	}

	nodeStats.strawberryCount += node.strawberryCount;
	nodeStats.totalStrawberries += node.totalStrawberries;
	nodeStats.bestDashes += node.bestDashes;
	nodeStats.bestDeaths += node.bestDeaths;
	nodeStats.bestFullClearTime += node.bestFullClearTime;
	nodeStats.bestTime += node.bestTime;

	if (!node.fullClear) {
		nodeStats.fullClear = false;
	}
	if (!node.heartGem) {
		nodeStats.heartGem = false;
	}
	if (!node.singleRunCompleted) {
		nodeStats.singleRunCompleted = false;
	}
}

function validateCompleted(attr: MapAttributesResponse, title: string) {
	const missing: string[] = [];
	if (attr.ClearTime == null) {
		missing.push("ClearTime");
	}
	if (attr.ClearDeaths == null) {
		missing.push("ClearDeaths");
	}
	if (attr.StrawberryCount == null) {
		missing.push("StrawberryCount");
	}

	if (missing.length === 0) {
		return;
	}

	toast.warn(
		<span>
			<b>{title}</b> missing
			<br />
			{joinElems(
				missing.map((a, index) => <i key={index}>{a}</i>),
				", ",
				" and ",
			)}
		</span>,
	);
}

function validateAttrs(
	attr: MapAttributesResponse,
	title: string,
	parent: NodeStats | null,
	isSingularSide: boolean,
) {
	const parentPath = parent ? getNodePath(parent) : null;
	let path = parentPath;
	if (!isSingularSide) {
		path += parentPath ? `/${title}` : title;
	}
	path ??= "Unknown";

	if (attr.Completed === "true") {
		validateCompleted(attr, path);
	}

	const invalids: [string, unknown][] = [];
	if (parseInt(attr.TimePlayed) < 0) {
		invalids.push(["TimePlayed", attr.TimePlayed]);
	}
	if ((attr.ClearTime ?? 0) < 0) {
		invalids.push(["ClearTime", attr.ClearTime]);
	}
	if (parseInt(attr.Deaths) < 0) {
		invalids.push(["Deaths", attr.Deaths]);
	}
	if ((attr.ClearDeaths ?? 0) < 0) {
		invalids.push(["ClearDeaths", attr.ClearDeaths]);
	}
	if ((attr.StrawberryCount ?? 0) < 0) {
		invalids.push(["StrawberryCount", attr.StrawberryCount]);
	}
	if (parseInt(attr.TotalStrawberries) < 0) {
		invalids.push(["TotalStrawberries", attr.TotalStrawberries]);
	}

	if (invalids.length === 0) {
		return;
	}

	toast.warn(
		<span>
			<b>{parentPath}</b> has invalid parameters
			<br />
			{joinElems(
				invalids.map((a, index) => <i key={index}>{`${a[0]} = ${a[1]}`}</i>),
				<br />,
			)}
		</span>,
	);
}

function statAttributesToNode(
	attr: MapAttributesResponse,
	key: number | string,
	parent: NodeStats | null,
	isSingularSide: boolean,
): NodeStats {
	const mode = Number.isInteger(key)
		? (key as number)
		: parseInt(key as string);
	const title = modeNumberToTitle(mode);
	validateAttrs(attr, title, parent, isSingularSide);

	const completed = attr.Completed === "true" || attr.ClearDate != null;

	return {
		title,
		completed,
		hasAnyCompleted: completed,

		timePlayed: parseInt(attr.TimePlayed),
		clearTime: attr.ClearTime ?? 0,
		deaths: parseInt(attr.Deaths),
		clearDeaths: attr.ClearDeaths ?? 0,

		clearDate: attr.ClearDate,
		strawberryCount: attr.StrawberryCount ?? 0,
		totalStrawberries: parseInt(attr.TotalStrawberries),
		bestDashes: parseInt(attr.BestDashes),
		bestDeaths: parseInt(attr.BestDeaths),
		bestFullClearTime: parseInt(attr.BestFullClearTime),
		bestTime: parseInt(attr.BestTime),
		fullClear: attr.FullClear === "true",
		heartGem: attr.HeartGem === "true",
		singleRunCompleted: attr.SingleRunCompleted === "true",
		isMode: true,
		mode,
		isChapter: false,
		parent,
		children: [],
	};
}

function getLocalStats(filter: StatsFilter) {
	trace("getLocalStats");
	const saveDataStr = localData.getLocalStats();

	if (saveDataStr == null) {
		return null;
	}

	const saveData: SaveDataResponse = JSON.parse(saveDataStr);

	const statsResult = recurseNodes(saveData.levelSetStats, filter);

	if (statsResult.failed) {
		return {};
	}

	const stats = statsResult.value;
	stats.title = "RootNode";
	stats.isRoot = true;
	return { levelSetStats: stats, timestamp: saveData.timestamp };
}

export function useCelesteStats() {
	const saveDataState = useContext(CelesteStatsContextProvider);

	if (!saveDataState) {
		throw new Error(
			"All components that use the celeste stats context must be placed within a CelesteStatsContext element.",
		);
	}

	return saveDataState;
}

interface RefreshStatsParams {
	silent: boolean;
}

export const StatsFilterTypeArray = ["current", "clear", "diff"] as const;
export const StatsFilterSortByArray = [
	"title",
	"date",
	"time",
	"deaths",
] as const;
export const MapsLayoutTypeValues = ["campaigns", "maps"] as const;
export type StatsFilterSortByType = (typeof StatsFilterSortByArray)[number];
export type MapsLayoutType = (typeof MapsLayoutTypeValues)[number];
export const StatsFilterDefault: StatsFilter = {
	type: "current",
	sortBy: { type: "title", direction: "descending" },
	showCleared: true,
	showUncleared: true,
	layoutType: "campaigns",
} as const;
export interface StatsFilter {
	type: (typeof StatsFilterTypeArray)[number];
	sortBy: {
		type: StatsFilterSortByType;
		direction: "ascending" | "descending";
	};
	showCleared: boolean;
	showUncleared: boolean;
	layoutType: MapsLayoutType;
}

const CelesteStatsContextProvider = createContext<{
	saveData: SaveData;
	refreshStats: (params: RefreshStatsParams) => Promise<null>;
	filter: StatsFilter;
	setFilter: React.Dispatch<React.SetStateAction<StatsFilter>>;
} | null>(null);

export default function CelesteStatsContext({
	celesteStatsSrc,
	filterState,
	children,
}: {
	celesteStatsSrc: string;
	filterState: [StatsFilter, React.Dispatch<React.SetStateAction<StatsFilter>>];
	children: ReactNode;
}) {
	trace("CelesteStatsContext");

	const [filter, setFilterState] = filterState;

	const [saveData, setSaveData] = useState<SaveData | null>(() =>
		getLocalStats(filter),
	);

	const setFilter = useCallback(
		(args: StatsFilter | ((prev: StatsFilter) => StatsFilter)) => {
			let newFilter: StatsFilter;

			if (typeof args === "function") {
				newFilter = args(filter);
			} else {
				newFilter = args;
			}

			// update previous filter as well to update anything that is currently capturing a reference to the previous filter
			for (const _key of Object.keys(filter)) {
				const key = _key as keyof typeof filter;
				(filter[key] as unknown) = newFilter[key];
			}

			localData.setStatsFilter(newFilter);
			setFilterState(newFilter);
			setSaveData(getLocalStats(newFilter));
		},
		[setFilterState, filter],
	);

	console.log(saveData);

	const refreshStats = useCallback(
		({ silent }: RefreshStatsParams = { silent: false }) => {
			if (import.meta.env.VITE_DISABLE_STAT_REFRESH === "true") {
				return new Promise<null>((resolve) => resolve(null));
			}

			let toastId = null;
			if (!silent) {
				toastId = toast.loading(
					<span>
						Refreshing Stats <i>[Connecting...]</i>
					</span>,
				);
			}
			let isConnected = false;
			const controller = new AbortController();
			setTimeout(() => {
				if (!isConnected) {
					controller.abort();
				}
			}, 10000);

			return new Promise<null>((resolve) => {
				fetch(
					import.meta.env.VITE_USE_SERVER_DEV === "true"
						? `${celesteStatsSrc}/celesteSaves/celesteSaves.php?dev`
						: `${celesteStatsSrc}/celesteSaves/celesteSaves.php`,
					{
						signal: controller.signal,
					},
				)
					.then(async (response) => {
						isConnected = true;

						if (!response.ok) {
							const errorBody = await response.text();
							throw new Error(
								`HTTP error! status: ${response.status}, message: ${errorBody}`,
							);
						}

						if (toastId != null) {
							toast.update(toastId, {
								render: "Refreshing Stats",
							});
						}

						const saveData: SaveDataResponse = await response.json();

						const statsResult = recurseNodes(saveData.levelSetStats, filter);
						if (statsResult.failed) {
							throw statsResult.error;
						}
						const stats = statsResult.value;
						stats.title = "RootNode";
						stats.isRoot = true;

						// exclude 'parent' from saveData to not have a cyclic value
						const dataToSave = JSON.stringify(saveData, (key, value) => {
							if (key === "parent") {
								return undefined;
							}
							return value;
						});

						localData.setLocalStats(dataToSave);
						setSaveData({
							levelSetStats: stats,
							timestamp: saveData.timestamp,
						});

						if (toastId != null) {
							toast.update(toastId, {
								render: "Stats Updated!",
								type: "success",
								isLoading: false,
								autoClose: 3000,
							});
						}
					})
					.catch((reason) => {
						logError(reason);

						let errorMessage = "Unknown error";
						if (reason instanceof Error) {
							errorMessage = reason.message;
						}
						if (toastId != null) {
							toast.update(toastId, {
								render: (
									<span>
										<b>Getting celeste stats failed</b>
										<hr />
										<i>{errorMessage}</i>
									</span>
								),
								type: "error",
								isLoading: false,
								autoClose: 10000,
							});
						}
					})
					.finally(() => resolve(null));
			});
		},
		[celesteStatsSrc, filter],
	);

	if (!saveData) {
		refreshStats();
	}

	return (
		<CelesteStatsContextProvider.Provider
			value={{ saveData: saveData ?? {}, refreshStats, filter, setFilter }}
		>
			{saveData ? children : null}
		</CelesteStatsContextProvider.Provider>
	);
}
