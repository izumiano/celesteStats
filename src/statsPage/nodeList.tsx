import "./nodeList.css";

import Node from "./node";
import { nodeIncludes, type NodeStats } from "./nodeTypes";
import type { CSSProperties } from "react";

interface NodeListStyle extends CSSProperties {
	"--childCount": number;
}

function getRecursiveChildCount(stats: NodeStats[] | undefined): number {
	if (!stats) {
		return 0;
	}

	return (
		stats.length +
		stats
			.map(
				(child) =>
					getRecursiveChildCount(child.children) + child.children.length,
			)
			.reduce((prev, curr) => prev + curr, 0)
	);
}

export default function NodeList({
	parentId,
	stats,
	expanded,
	searchQuery,
}: {
	parentId: string;
	stats: NodeStats[] | undefined;
	expanded: boolean;
	searchQuery: string;
}) {
	let foundQuery = false;

	return (
		<div
			className={`nodeList ${expanded ? "expanded" : ""}`}
			style={{ "--childCount": getRecursiveChildCount(stats) } as NodeListStyle}
		>
			{stats?.map((node) => {
				if (searchQuery !== "") {
					if (node.title.toLowerCase().includes(searchQuery.toLowerCase())) {
						foundQuery = true;
					} else if (!nodeIncludes(node, searchQuery)) {
						return null;
					}
				}

				const id = `${parentId}/${node.title}`;

				return (
					<Node
						key={id}
						node={node}
						id={id}
						searchQuery={foundQuery ? "" : searchQuery}
					/>
				);
			})}
		</div>
	);
}
