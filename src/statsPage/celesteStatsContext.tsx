import { logError } from "@izumiano/vite-logger";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import { toast } from "react-toastify";
import localData from "../localData";
import type { NodeStats, SaveData } from "./nodeTypes";

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

interface MapStatsResponse {
	"@attributes": MapAttributesResponse;
}

type LevelSetStatsResponse = {
	[key: string]: LevelSetStatsResponse | MapStatsResponse[];
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
	stats: MapStatsResponse[] | LevelSetStatsResponse,
	parent: NodeStats | null = null,
) {
	const nodeStats: NodeStats = {
		children: [],
		parent,

		isMode: false,

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

	// is mode stats
	if (Array.isArray(stats)) {
		const pushToNodeStats = stats.length > 1;

		for (const [index, stat] of stats.entries()) {
			const attr = stat["@attributes"];

			const title = modeNumberToTitle(index);

			const node = statAttributesToNode(attr, title, parent);
			handleNodeStats(nodeStats, node, pushToNodeStats);
		}
	} else {
		for (const [title, stat] of Object.entries(stats)) {
			const node = recurseNodes(stat, nodeStats);
			node.title = title;
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
		parent,
		children: [],
	};
}

function getLocalStats() {
	const saveDataStr = localData.getLocalStats();

	if (saveDataStr == null) {
		return null;
	}

	const saveData: SaveDataResponse = JSON.parse(saveDataStr);

	const stats = recurseNodes(saveData.levelSetStats);
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
	saveData: SaveData | null;
	refreshStats: (params: RefreshStatsParams) => void;
} | null>(null);

export default function CelesteStatsContext({
	celesteStatsSrc,
	children,
}: {
	celesteStatsSrc: string;
	children: ReactNode;
}) {
	const [saveData, setSaveData] = useState<SaveData | null>(getLocalStats());

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

						const stats = recurseNodes(saveData.levelSetStats);
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
								render: `Getting celeste stats failed with error: ${errorMessage}`,
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

	useEffect(() => {
		refreshStats();
	}, [refreshStats]);

	return (
		<CelesteStatsContextProvider.Provider value={{ saveData, refreshStats }}>
			{saveData ? children : null}
		</CelesteStatsContextProvider.Provider>
	);
}
