import "./nodeList.css";

import Node from "./node";
import { nodeIncludes, type NodeStats, type NodeStatType } from "./nodeTypes";
import { useRef, type CSSProperties } from "react";
import useForceRerender from "../hooks/useForceRerender";

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
	statType,
	searchQuery,
}: {
	parentId: string;
	stats: NodeStats[] | undefined;
	expanded: boolean;
	statType: NodeStatType;
	searchQuery: string;
}) {
	let foundQuery = false;

	const animationState = useRef({
		expanded,
		isAnimating: false,
	});

	if (expanded !== animationState.current.expanded) {
		animationState.current = { expanded, isAnimating: true };
	}

	const forceRerender = useForceRerender();

	return (
		<div
			onTransitionEnd={(event) => {
				if (event.propertyName !== "max-height") {
					return;
				}
				animationState.current = { expanded, isAnimating: false };
				forceRerender();
			}}
			className={`nodeList ${expanded ? "expanded" : ""}`}
			style={{ "--childCount": getRecursiveChildCount(stats) } as NodeListStyle}
		>
			{(expanded || animationState.current.isAnimating) &&
				stats?.map((node) => {
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
							statType={statType}
							searchQuery={foundQuery ? "" : searchQuery}
						/>
					);
				})}
		</div>
	);
}
