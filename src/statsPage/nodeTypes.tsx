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

export interface SaveData {
	levelSetStats: NodeStats;
	timestamp: number;
}

export const NodeStatTypeArray = ["current", "clear", "diff"] as const;
export type NodeStatType = (typeof NodeStatTypeArray)[number];

export function nodeIncludes(node: NodeStats, query: string): boolean {
	query = query.toLowerCase();

	return node.children.some(
		(child) =>
			child.title.toLowerCase().includes(query) ||
			nodeIncludes(child, query.toLowerCase()),
	);
}
