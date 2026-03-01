import dropdownIcon from "../assets/dropdown.png";

import { useState } from "react";
import NodeList from "./nodeList";
import { formatTime } from "./utils";
import type { NodeStats } from "./useCelesteStats";

export default function Node({
	node,
	id,
	index,
}: {
	node: NodeStats;
	id: string;
	index: number;
}) {
	const [expanded, setExpanded] = useState(false);

	const hasChildren = node.children.length > 0;

	return (
		<>
			<div
				className="thisOne"
				onClick={() => {
					if (!hasChildren) {
						return;
					}

					setExpanded((prev) => !prev);
				}}
			>
				<h2>
					{`${index + 1} ${node.title}`}
					{hasChildren && (
						<img
							src={dropdownIcon}
							width={15}
							height={15}
							style={{ rotate: expanded ? "180deg" : "0deg" }}
						/>
					)}
				</h2>
				<span>{`Time: ${formatTime(node.timePlayed)}, Deaths: ${node.deaths}`}</span>
			</div>
			{expanded && (
				<div className="indent">
					<NodeList parentId={id} stats={node.children} />
				</div>
			)}
		</>
	);
}
