import dropdownIcon from "../assets/dropdown.png";
import "./node.css";
import timeIcon from "../assets/time.png";
import deathsIcon from "../assets/deaths.png";
import tabIcon from "../assets/tab.png";

import { useRef, useState } from "react";
import NodeList from "./nodeList";
import { formatTime } from "../utils";
import {
	getParentPath,
	recurseParentPath,
	tryChangeTitle,
	type ModeSpecificStats,
	type NodeStats,
} from "./nodeTypes";
import LoadingSpinner from "../shared/loadingSpinner";
import {
	useCelesteStats,
	type StatsFilter,
} from "../shared/celesteStatsContext";
import DeleteButton from "./header/deleteButton";

export default function Node({
	node,
	id,
	filter,
	searchQuery,
	forceShowMapLink,
}: {
	node: NodeStats;
	id: string;
	filter: StatsFilter;
	searchQuery?: string;
	forceShowMapLink?: boolean;
}) {
	const { refreshStats } = useCelesteStats();
	const [expanded, setExpanded] = useState(false);
	const [renameLoadingState, setRenameLoadingState] = useState<
		"finished" | "loading"
	>("finished");

	const titleRef = useRef(node.title);

	const hasChildren = node.children.length > 0;

	const time = (() => {
		switch (filter.type) {
			case "clear":
				return node.clearTime;
			case "current":
				return node.timePlayed;
			case "diff":
				return node.timePlayed - node.clearTime;
		}
	})();

	const deaths = (() => {
		switch (filter.type) {
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
			await refreshStats({ silent: true });
		} else {
			titleRef.current = node.title;
		}

		setRenameLoadingState("finished");
	};

	const canBeDeleted = !node.isChapter && !node.isMode;

	// biome-ignore lint/style/noNonNullAssertion: <parent should only ever be null on root node and root node should never be displayed>
	const nodeForMapLink = forceShowMapLink && node.isMode ? node.parent! : node;

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
					<div className="flex alignItems flex-wrap">
						{renameLoadingState === "finished" && !node.isMode ? (
							// TODO: fix potential issue where value doesn't update when node.title changes
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
						{filter.layoutType === "maps" && (
							<div className="mapPathContainer">
								{recurseParentPath(node).map((title, index) => (
									<span
										key={`${id}_${node.sid ?? `${node.parent?.sid}${(node as ModeSpecificStats).mode}`}_${index}_path`}
									>
										{title}
									</span>
								))}
							</div>
						)}
						<div
							className="mapLinks flex"
							onClick={(event) => event.stopPropagation()}
						>
							{nodeForMapLink.sid && (
								<a
									href={`/celesteStats/maps/?path=${[getParentPath(nodeForMapLink), nodeForMapLink.title].filter((segment) => !!segment).join("/")}`}
									className="flex mapLink"
								>
									<img
										src={tabIcon}
										alt="open in new tab"
										width={20}
										height={20}
									/>
								</a>
							)}
						</div>
					</div>
					<div className="nodeStats">
						<div className="flex align-center">
							<img src={timeIcon} alt="time icon" width={20} height={20} />
							{filter.type === "diff" ? "+" : ""}
							<span>{time != null ? formatTime(time) : "?"}</span>
						</div>
						<div className="flex align-center">
							<img src={deathsIcon} alt="deaths icon" width={20} height={20} />
							<span>
								{filter.type === "diff" ? "+" : ""}
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
				filter={filter}
				searchQuery={searchQuery}
			/>
		</div>
	);
}
