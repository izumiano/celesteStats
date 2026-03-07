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

	isMode: boolean;

	parent: NodeStats | null;
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

function recurseParentPath(node: NodeStats, pathArr: string[] = []): string[] {
	const parent = node.parent;

	if (!parent || !parent.parent) {
		return [];
	}

	pathArr.push(parent.title);

	recurseParentPath(parent, pathArr);

	return pathArr;
}

export function getParentPath(node: NodeStats) {
	const pathArr = recurseParentPath(node);

	if (pathArr.length <= 0) {
		return "";
	}

	if (pathArr.length === 1) {
		return `${pathArr[0]}/`;
	}

	return `${pathArr.reduce((prev, curr) => `${curr}/${prev}`)}/`;
}

export function getChildPaths(
	node: NodeStats,
	path: string = "",
	pathArr: string[] = [],
): string[] {
	let allWereMode = true;
	for (const child of node.children) {
		if (child.isMode) {
			continue;
		}
		allWereMode = false;

		getChildPaths(child, `${path}/${child.title}`, pathArr);
	}

	if (allWereMode) {
		pathArr.push(path);
	}

	return pathArr;
}
