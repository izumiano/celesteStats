import dropdownIcon from "../assets/dropdown.png";
import "./node.css";
import timeIcon from "../assets/time.png";
import deathsIcon from "../assets/deaths.png";

import { useRef, useState } from "react";
import NodeList from "./nodeList";
import { formatTime } from "../utils";
import { tryChangeTitle, type NodeStats, type NodeStatType } from "./nodeTypes";
import LoadingSpinner from "../shared/loadingSpinner";
import { useCelesteStats } from "./celesteStatsContext";
import DeleteButton from "./header/deleteButton";

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
	const { refreshStats } = useCelesteStats();
	const [expanded, setExpanded] = useState(false);
	const [renameLoadingState, setRenameLoadingState] = useState<
		"finished" | "loading"
	>("finished");

	const titleRef = useRef(node.title);

	const hasChildren = node.children.length > 0;

	const time = (() => {
		switch (statType) {
			case "clear":
				return node.clearTime;
			case "current":
				return node.timePlayed;
			case "diff":
				return node.timePlayed - node.clearTime;
		}
	})();

	const deaths = (() => {
		switch (statType) {
			case "clear":
				return node.clearDeaths;
			case "current":
				return node.deaths;
			case "diff":
				return node.deaths - node.clearDeaths;
		}
	})();

	const changeTitle = async (title: string) => {
		setRenameLoadingState("loading");

		const success = await tryChangeTitle(node, title);

		if (success) {
			refreshStats({ silent: true });
		} else {
			titleRef.current = node.title;
		}

		setRenameLoadingState("finished");
	};

	const canBeDeleted = !node.isChapter && !node.isMode;

	return (
		<div
			className={`node ${expanded ? "expanded" : ""} ${hasChildren ? "" : "empty"} ${canBeDeleted ? "deletable" : ""}`}
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
				<div className="nodeInfo">
					{renameLoadingState === "finished" && !node.isMode ? (
						<input
							defaultValue={titleRef.current}
							className="nodeTitle"
							onClick={(event) => {
								event.stopPropagation(); // dont expand node if clicking here
							}}
							onChange={(event) => {
								titleRef.current = event.target.value;
							}}
							onKeyDown={(event) => {
								if (event.key !== "Enter") {
									return;
								}

								event.preventDefault();
								const target = event.currentTarget;
								target.blur();
							}}
							onBlur={(event) => {
								changeTitle(event.target.value);
							}}
						/>
					) : (
						<div className="flex">
							<h2 className="nodeTitle">{titleRef.current}</h2>
							{renameLoadingState === "loading" && (
								<LoadingSpinner props={{ size: "1.5rem", centered: true }} />
							)}
						</div>
					)}
					<div className="nodeStats">
						<div className="flex align-center">
							<img src={timeIcon} alt="time icon" width={20} height={20} />
							{statType === "diff" ? "+" : ""}
							<span>{time != null ? formatTime(time) : "?"}</span>
						</div>
						<div className="flex align-center">
							<img src={deathsIcon} alt="deaths icon" width={20} height={20} />
							<span>
								{statType === "diff" ? "+" : ""}
								{deaths ?? "?"}
							</span>
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
				{canBeDeleted && (
					<DeleteButton node={node} refreshStats={refreshStats} />
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
