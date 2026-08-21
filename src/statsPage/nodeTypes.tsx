import { trace } from "@izumiano/vite-logger";
import type { ReactNode } from "react";
import React from "react";
import { toast } from "react-toastify";
import localData from "../localData";
import type { StatsFilter } from "../shared/celesteStatsContext";

export type ModeSpecificStats = { isMode: true; mode: number };

export type NodeStats = {
	title: string;

	completed: boolean;
	hasAnyCompleted: boolean;

	timePlayed: number;
	clearTime: number;
	deaths: number;
	clearDeaths: number;

	clearDate: number | null;
	strawberryCount: number;
	totalStrawberries: number;
	bestDashes: number;
	bestDeaths: number;
	bestFullClearTime: number;
	bestTime: number;
	fullClear: boolean;
	heartGem: boolean;
	singleRunCompleted: boolean;

	isChapter: boolean;
	sid?: string;

	parent: NodeStats | null;
	children: NodeStats[];
	isRoot?: boolean;
} & (ModeSpecificStats | { isMode: false });

export interface SaveData {
	levelSetStats?: NodeStats;
	timestamp?: number;
}

export function nodeIncludes(node: NodeStats, query: string): boolean {
	query = query.toLowerCase();

	return node.children.some(
		(child) =>
			child.title.toLowerCase().includes(query) ||
			nodeIncludes(child, query.toLowerCase()),
	);
}

export function recurseParentPath(
	node: NodeStats,
	pathArr: string[] = [],
): string[] {
	const parent = node.parent;

	if (!parent || !parent.parent) {
		return [];
	}

	pathArr.push(escapeCharacters(parent.title));

	recurseParentPath(parent, pathArr);

	return pathArr;
}

export function getNodePath(node: NodeStats) {
	let path = "";
	const parentPath = getParentPath(node);
	if (parentPath !== "") {
		path += `${parentPath}/`;
	}
	return `${path}${node.title}`;
}

export function getParentPath(node: NodeStats) {
	const pathArr = recurseParentPath(node);

	if (pathArr.length <= 0) {
		return "";
	}

	if (pathArr.length === 1) {
		return `${pathArr[0]}`;
	}

	return `${pathArr.reduce((prev, curr) => `${curr}/${prev}`)}`;
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

		getChildPaths(child, `${path}/${escapeCharacters(child.title)}`, pathArr);
	}

	if (allWereMode) {
		pathArr.push(path);
	}

	return pathArr;
}

const charactersToEscape = ["/"];
function escapeCharacters(str: string) {
	str = str.replaceAll("\\", "\\\\"); // '\\' has to happen first
	for (const char of charactersToEscape) {
		str = str.replaceAll(char, `\\${char}`);
	}

	return str;
}

async function tryChangeTitleInternal(
	node: NodeStats,
	title: string,
	errorMessage: ReactNode,
): Promise<boolean> {
	const path = getParentPath(node);

	const nodeTitle = escapeCharacters(node.title);
	title = escapeCharacters(title);

	console.log({ title, nodeTitle });

	const oldName = (() => {
		if (path === "") {
			return nodeTitle;
		} else if (nodeTitle === "") {
			return path;
		}
		return `${path}/${nodeTitle}`;
	})();
	const newName = (() => {
		if (path === "") {
			return title;
		} else if (title === "") {
			return path;
		}
		return `${path}/${title}`;
	})();
	const mapNames = getChildPaths(node);

	trace({ oldName, newName, mapNames });

	const onFail = (reason: unknown) => {
		let message: ReactNode;

		if (React.isValidElement(reason)) {
			message = reason;
		} else if (reason instanceof Error) {
			message = (
				<>
					<div>
						<b>{reason.name}</b>:
					</div>
					{reason.message}
				</>
			);
		} else {
			message = (
				<>
					<div>
						<b>Unknown Error</b>:
					</div>
					{JSON.stringify(reason)}
				</>
			);
		}

		toast.error(
			<span>
				{errorMessage}
				<hr />
				<i>{message}</i>
			</span>,
		);
	};

	try {
		const response = await fetch(
			import.meta.env.VITE_USE_SERVER_DEV === "true"
				? `${localData.getCelesteStatsSrc()}/celesteSaves/database.php?q=changeMapName&dev`
				: `${localData.getCelesteStatsSrc()}/celesteSaves/database.php?q=changeMapName`,
			{ method: "POST", body: JSON.stringify({ oldName, newName, mapNames }) },
		);
		const body = await response.json();

		if (!response.ok) {
			if (body.errorType) {
				onFail(
					<>
						<div>
							<b>{body.errorType}</b>:
						</div>
						{body.errorMessage}
					</>,
				);
			} else {
				onFail(
					<i>
						<b>{response.status}</b> {response.statusText}
					</i>,
				);
			}

			return false;
		}

		node.title = title;
		return true;
	} catch (reason) {
		onFail(reason);
		return false;
	}
}

export async function tryChangeTitle(
	node: NodeStats,
	title: string,
): Promise<boolean> {
	if (title === node.title) {
		return false;
	}

	if (title === "") {
		toast.error("Title must have at least one character");
		return false;
	}

	return await tryChangeTitleInternal(
		node,
		title,
		<>
			Failed changing name from <b>{node.title}</b> to <b>{title}</b>
		</>,
	);
}

export async function tryDeleteNode(node: NodeStats) {
	return await tryChangeTitleInternal(
		node,
		"",
		<>
			Failed deleting <b>{node.title}</b>
		</>,
	);
}

export function sortNodes(nodes: NodeStats[], filter: StatsFilter) {
	const sortBy = filter.sortBy;

	const direction = sortBy.direction === "descending" ? 1 : -1;

	switch (sortBy.type) {
		case "title":
			nodes.sort((nodeA, nodeB) => {
				return nodeA.title.localeCompare(nodeB.title) * direction;
			});
			break;
		case "time":
			nodes.sort((nodeA, nodeB) => {
				let timeA = 0;
				let timeB = 0;
				switch (filter.type) {
					case "current":
						timeA = nodeA.timePlayed;
						timeB = nodeB.timePlayed;
						break;
					case "clear":
						timeA = nodeA.clearTime;
						timeB = nodeB.clearTime;
						break;
					case "diff":
						timeA = nodeA.timePlayed - nodeA.clearTime;
						timeB = nodeB.timePlayed - nodeB.clearTime;
						break;
				}

				return (timeB - timeA) * direction;
			});
			break;
		case "deaths":
			nodes.sort((nodeA, nodeB) => {
				let deathsA = 0;
				let deathsB = 0;
				switch (filter.type) {
					case "current":
						deathsA = nodeA.deaths;
						deathsB = nodeB.deaths;
						break;
					case "clear":
						deathsA = nodeA.clearDeaths;
						deathsB = nodeB.clearDeaths;
						break;
					case "diff":
						deathsA = nodeA.deaths - nodeA.clearDeaths;
						deathsB = nodeB.deaths - nodeB.clearDeaths;
						break;
				}

				return (deathsB - deathsA) * direction;
			});
			break;
		case "date":
			nodes.sort((nodeA, nodeB) => {
				if (nodeB.clearDate == null) {
					return -1;
				}
				if (nodeA.clearDate == null) {
					return 1;
				}

				return (nodeB.clearDate - nodeA.clearDate) * direction;
			});
			break;
	}
}

export function nodeShouldBeShown(
	node: NodeStats,
	searchQuery: string | undefined,
	searchParent?: boolean,
) {
	searchQuery = searchQuery?.toLowerCase();

	let foundQuery = false;
	if (searchQuery) {
		if (node.title.toLowerCase().includes(searchQuery)) {
			foundQuery = true;
		} else if (!nodeIncludes(node, searchQuery)) {
			if (searchParent) {
				for (const title of recurseParentPath(node)) {
					if (title.toLowerCase().includes(searchQuery)) {
						return { shouldShow: true, foundQuery: true };
					}
				}
			}
			return { shouldShow: false, foundQuery: false };
		}
	}

	return { shouldShow: true, foundQuery };
}
