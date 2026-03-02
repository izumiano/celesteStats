import dropdownIcon from "../assets/dropdown.png";
import "./node.css";

import { useState } from "react";
import NodeList from "./nodeList";
import { formatTime } from "../utils";
import type { NodeStats } from "./nodeTypes";

export default function Node({
	node,
	id,
	searchQuery,
}: {
	node: NodeStats;
	id: string;
	searchQuery: string;
}) {
	const [expanded, setExpanded] = useState(false);

	const hasChildren = node.children.length > 0;

	return (
		<div
			className={`node ${expanded ? "expanded" : ""} ${hasChildren ? "" : "empty"}`}
		>
			<div
				onClick={() => {
					if (!hasChildren) {
						return;
					}

					setExpanded((prev) => !prev);
				}}
				className="nodeHeader"
			>
				<div>
					<h2 className="nodeTitle">
						<span>{node.title}</span>
					</h2>
					<span>{`Time: ${formatTime(node.timePlayed)}, Deaths: ${node.deaths}`}</span>
				</div>
				{hasChildren && (
					<img
						src={dropdownIcon}
						width={15}
						height={15}
						className="unselectable"
						style={{ rotate: expanded ? "180deg" : "0deg" }}
					/>
				)}
			</div>

			<NodeList
				parentId={id}
				stats={node.children}
				expanded={expanded}
				searchQuery={searchQuery}
			/>
		</div>
	);
}
