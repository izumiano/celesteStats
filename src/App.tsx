import { useEffect, useId, useState } from "react";
import "./App.css";
import { log } from "@izumiano/vite-logger";

function addLeadingZeroes(val: number, totalDigits: number) {
	return (10 ** totalDigits + val).toString().slice(1); // (123, 4), 10^4 + 123 = 10123
}

function formatTime(ticks: number) {
	const hours = ticks / 36000000000.0;
	const hoursInt = Math.floor(hours);
	const minutes = (hours - hoursInt) * 60;
	const minutesInt = Math.floor(minutes);
	const seconds = (minutes - minutesInt) * 60;
	const secondsInt = Math.floor(seconds);
	const milliseconds = (seconds - secondsInt) * 1000;
	const millisecondsInt = Math.floor(milliseconds);

	return `${hoursInt}:${addLeadingZeroes(minutesInt, 2)}:${addLeadingZeroes(secondsInt, 2)}:${addLeadingZeroes(millisecondsInt, 3)}`;
}

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

interface NodeStats {
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

export default function App() {
	const [saveData, setSaveData] = useState<SaveData | null>(null);

	useEffect(() => {
		(async () => {
			const saveData: SaveDataResponse = await (
				await fetch(import.meta.env.VITE_CELESTE_STATS)
			).json();
			log(saveData);

			const stats = recurseNodes(saveData.levelSetStats);

			setSaveData({ levelSetStats: stats, timestamp: saveData.timestamp });
		})();
	}, []);

	const id = useId();

	log({ saveData });

	return (
		<div>
			<header>
				<h1>
					Total Time:{" "}
					{saveData ? formatTime(saveData.levelSetStats.timePlayed) : "?"}
				</h1>
				<h1>Total Deaths: {saveData?.levelSetStats.deaths ?? "?"}</h1>
			</header>
			{saveData?.levelSetStats.children.map((node, index) => {
				return (
					<div key={id + node.title}>
						<h2>{`${index + 1} ${node.title}`}</h2>
						<span>{`Time: ${formatTime(node.timePlayed)}, Deaths: ${node.deaths}`}</span>
					</div>
				);
			})}
		</div>
	);
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

			const node = statAttributesToNode(attr, `${index}`);
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
