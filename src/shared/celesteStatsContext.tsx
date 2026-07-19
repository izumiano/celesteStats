import { logError } from "@izumiano/vite-logger";
import {
	createContext,
	useCallback,
	useContext,
	useState,
	type ReactNode,
} from "react";
import { toast } from "react-toastify";
import localData from "../localData";
import type { NodeStats, SaveData } from "../statsPage/nodeTypes";
import { tryCatch } from "../utils";

interface MapAttributesResponse {
	Completed: "true" | "false";
	TimePlayed: string;
	ClearTime: string;
	Deaths: string;
	ClearDeaths: string;
	StrawberryCount: string;
	TotalStrawberries: string;
	BestDashes: string;
	BestDeaths: string;
	BestFullClearTime: string;
	BestTime: string;
	FullClear: "true" | "false";
	HeartGem: "true" | "false";
	SingleRunCompleted: "true" | "false";
}

interface ChapterStatsResponse {
	sid: string;
	modes: { "@attributes": MapAttributesResponse }[];
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
): { failed: false; value: NodeStats } | { failed: true; error: unknown } {
	return tryCatch(() => _recurseNodesImpl(stats));
}

function _recurseNodesImpl(
	stats: ChapterStatsResponse | LevelSetStatsResponse,
	parent: NodeStats | null = null,
) {
	const nodeStats: NodeStats = {
		children: [],
		parent,

		isMode: false,
		isChapter: false,

		title: "Unknown",
		completed: true,
		timePlayed: 0,
		clearTime: 0,
		deaths: 0,
		clearDeaths: 0,
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

	const modesStats = stats.modes;
	const sid = stats.sid;

	// is mode stats
	if (Array.isArray(modesStats) && typeof sid === "string") {
		if (parent) {
			nodeStats.sid = sid;
		}

		const pushToNodeStats = modesStats.length > 1;

		for (const [index, stat] of modesStats.entries()) {
			const attr = stat["@attributes"];

			const title = modeNumberToTitle(index);

			const node = statAttributesToNode(attr, title, parent);
			handleNodeStats(nodeStats, node, pushToNodeStats);
		}
	} else {
		for (const [title, stat] of Object.entries(stats)) {
			const node = _recurseNodesImpl(stat, nodeStats);
			node.title = title;
			node.isChapter = node.children[0]?.isMode ?? true;

			handleNodeStats(nodeStats, node);
		}
	}

	return nodeStats;
}

function handleNodeStats(
	nodeStats: NodeStats,
	node: NodeStats,
	pushToNodeStats = true,
) {
	if (pushToNodeStats) {
		nodeStats.children.push(node);
	}

	nodeStats.timePlayed += node.timePlayed;
	nodeStats.clearTime += node.clearTime;
	nodeStats.clearDeaths += node.clearDeaths;
	nodeStats.deaths += node.deaths;
	nodeStats.strawberryCount += node.strawberryCount;
	nodeStats.totalStrawberries += node.totalStrawberries;
	nodeStats.bestDashes += node.bestDashes;
	nodeStats.bestDeaths += node.bestDeaths;
	nodeStats.bestFullClearTime += node.bestFullClearTime;
	nodeStats.bestTime += node.bestTime;

	if (!node.completed) {
		nodeStats.completed = false;
	}
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

function statAttributesToNode(
	attr: MapAttributesResponse,
	title: string,
	parent: NodeStats | null,
): NodeStats {
	return {
		title,
		completed: attr.Completed === "true",
		timePlayed: parseInt(attr.TimePlayed),
		clearTime: parseInt(attr.ClearTime),
		deaths: parseInt(attr.Deaths),
		clearDeaths: parseInt(attr.ClearDeaths),
		strawberryCount: parseInt(attr.StrawberryCount),
		totalStrawberries: parseInt(attr.TotalStrawberries),
		bestDashes: parseInt(attr.BestDashes),
		bestDeaths: parseInt(attr.BestDeaths),
		bestFullClearTime: parseInt(attr.BestFullClearTime),
		bestTime: parseInt(attr.BestTime),
		fullClear: attr.FullClear === "true",
		heartGem: attr.HeartGem === "true",
		singleRunCompleted: attr.SingleRunCompleted === "true",
		isMode: true,
		isChapter: false,
		parent,
		children: [],
	};
}

function getLocalStats() {
	const saveDataStr = localData.getLocalStats();

	if (saveDataStr == null) {
		return {};
	}

	const saveData: SaveDataResponse = JSON.parse(saveDataStr);

	const statsResult = recurseNodes(saveData.levelSetStats);

	if (statsResult.failed) {
		return {};
	}

	const stats = statsResult.value;
	stats.title = "RootNode";
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

const CelesteStatsContextProvider = createContext<{
	saveData: SaveData;
	refreshStats: (params: RefreshStatsParams) => void;
} | null>(null);

export default function CelesteStatsContext({
	celesteStatsSrc,
	children,
}: {
	celesteStatsSrc: string;
	children: ReactNode;
}) {
	const [saveData, setSaveData] = useState<SaveData>(getLocalStats());

	const refreshStats = useCallback(
		({ silent }: RefreshStatsParams = { silent: false }) => {
			if (import.meta.env.VITE_DISABLE_STAT_REFRESH === "true") {
				return;
			}

			(async () => {
				let toastId = null;
				if (!silent) {
					toastId = toast.loading("Refreshing Stats");
				}
				let isConnected = false;
				const controller = new AbortController();
				setTimeout(() => {
					if (!isConnected) {
						controller.abort();
					}
				}, 10000);

				fetch(`${celesteStatsSrc}/celesteSaves/celesteSaves.php`, {
					signal: controller.signal,
				})
					.then(async (response) => {
						isConnected = true;

						if (!response.ok) {
							const errorBody = await response.text();
							throw new Error(
								`HTTP error! status: ${response.status}, message: ${errorBody}`,
							);
						}

						const saveData: SaveDataResponse = await response.json();

						const statsResult = recurseNodes(saveData.levelSetStats);
						if (statsResult.failed) {
							throw statsResult.error;
						}
						const stats = statsResult.value;
						stats.title = "RootNode";

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
					});
			})();
		},
		[celesteStatsSrc],
	);

	return (
		<CelesteStatsContextProvider.Provider value={{ saveData, refreshStats }}>
			{saveData ? children : null}
		</CelesteStatsContextProvider.Provider>
	);
}
