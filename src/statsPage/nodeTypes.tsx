import { trace } from "@izumiano/vite-logger";
import type { ReactNode } from "react";
import React from "react";
import { toast } from "react-toastify";
import localData from "../localData";

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
	isChapter: boolean;

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

		getChildPaths(child, `${path}/${child.title}`, pathArr);
	}

	if (allWereMode) {
		pathArr.push(path);
	}

	return pathArr;
}

async function tryChangeTitleInternal(
	node: NodeStats,
	title: string,
	errorMessage: ReactNode,
): Promise<boolean> {
	const path = getParentPath(node);

	const oldName = (() => {
		if (path === "") {
			return node.title;
		} else if (node.title === "") {
			return path;
		}
		return `${path}/${node.title}`;
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
			`${localData.getCelesteStatsSrc()}/celesteSaves/database.php?q=changeMapName`,
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
