import dropdownIcon from "../assets/dropdown.png";
import "./node.css";
import timeIcon from "../assets/time.png";
import deathsIcon from "../assets/deaths.png";

import { useState } from "react";
import NodeList from "./nodeList";
import { formatTime } from "../utils";
import type { NodeStats, NodeStatType } from "./nodeTypes";

export default function Node({
	node,
	id,
	statType,
	searchQuery,
}: {
	node: NodeStats;
	id: string;
	statType: NodeStatType;
	searchQuery: string;
}) {
	const [expanded, setExpanded] = useState(false);

	const hasChildren = node.children.length > 0;

	const time = (() => {
		if (statType === "clear") {
			return node.clearTime;
		}

		return node.timePlayed;
	})();

	const deaths = (() => {
		if (statType === "clear") {
			return node.clearDeaths;
		}

		return node.deaths;
	})();

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
					<h2 className="nodeTitle">{node.title}</h2>
					<div className="nodeStats">
						<div className="flex align-center">
							<img src={timeIcon} alt="time icon" width={20} height={20} />
							<span>{time != null ? formatTime(time) : "?"}</span>
						</div>
						<div className="flex align-center">
							<img src={deathsIcon} alt="deaths icon" width={20} height={20} />
							<span>{deaths ?? "?"}</span>
						</div>
					</div>
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
				statType={statType}
				searchQuery={searchQuery}
			/>
		</div>
	);
}
