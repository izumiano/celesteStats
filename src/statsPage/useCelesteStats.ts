import { logError } from "@izumiano/vite-logger";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import localData from "../localData";

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

//

export interface NodeStats {
	title: string;

	completed: boolean;
	timePlayed: number;
	clearTime: number;
	deaths: number;
	clearDeaths: number;
	strawberryCount: number;
	totalStrawberries: number;
	bestDashes: number;
	bestDeaths: number;
	bestFullClearTime: number;
	bestTime: number;
	fullClear: boolean;
	heartGem: boolean;
	singleRunCompleted: boolean;

	children: NodeStats[];
}

interface SaveData {
	levelSetStats: NodeStats;
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

function recurseNodes(stats: MapStatsResponse[] | LevelSetStatsResponse) {
	const nodeStats: NodeStats = {
		children: [],

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
		for (const [index, stat] of stats.entries()) {
			const attr = stat["@attributes"];

			const node = statAttributesToNode(attr, modeNumberToTitle(index));
			handleNodeStats(nodeStats, node);
		}
	} else {
		for (const [title, stat] of Object.entries(stats)) {
			const node = recurseNodes(stat);
			node.title = title;
			handleNodeStats(nodeStats, node);
		}
	}

	return nodeStats;
}

function handleNodeStats(nodeStats: NodeStats, node: NodeStats) {
	nodeStats.children.push(node);

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

export default function useCelesteStats(celesteStatsSrc: string) {
	const [saveData, setSaveData] = useState<SaveData | null>(getLocalStats());

	useEffect(() => {
		(async () => {
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

					localData.setLocalStats(JSON.stringify(saveData));
					setSaveData({ levelSetStats: stats, timestamp: saveData.timestamp });
				})
				.catch((reason) => {
					logError(reason);

					let errorMessage = "Unknown error";
					if (reason instanceof Error) {
						errorMessage = reason.message;
					}
					toast.error(
						`Getting celeste stats failed with error: ${errorMessage}`,
					);
				});
		})();
	}, [celesteStatsSrc]);

	return saveData;
}
