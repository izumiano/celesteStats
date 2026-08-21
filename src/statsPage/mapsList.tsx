import type { StatsFilter } from "../shared/celesteStatsContext";
import {
	nodeShouldBeShown,
	sortNodes,
	type ModeSpecificStats,
	type NodeStats,
} from "./nodeTypes";
import { useId } from "react";
import Node from "./node";

function recurseNodes(
	node: NodeStats,
	filter: StatsFilter,
	searchQuery: string,
) {
	const nodes: NodeStats[] = [];

	if (node.children.length === 0) {
		const { shouldShow } = nodeShouldBeShown(node, searchQuery);
		if (shouldShow && !node.isRoot) {
			nodes.push(node);
		}
		return nodes;
	}

	for (const child of node.children) {
		if ((child.isChapter && child.children.length === 0) || child.isMode) {
			const { shouldShow } = nodeShouldBeShown(child, searchQuery);
			if (shouldShow) {
				nodes.push(child);
			}
		} else {
			nodes.push(...recurseNodes(child, filter, searchQuery));
		}
	}
	return nodes;
}

export default function MapsList({
	stats,
	filter,
	searchQuery,
}: {
	stats: NodeStats | undefined;
	filter: StatsFilter;
	searchQuery: string;
}) {
	const id = useId();

	const nodes = stats ? recurseNodes(stats, filter, searchQuery) : [];
	sortNodes(nodes, filter);

	return (
		<div className="nodeList">
			{nodes?.map((node) => {
				return (
					<Node
						key={`${id}_${node.sid ?? `${node.parent?.sid}${(node as ModeSpecificStats).mode}`}_node`}
						id={id}
						node={node}
						filter={filter}
						forceShowMapLink
					/>
				);
			})}
		</div>
	);
}
