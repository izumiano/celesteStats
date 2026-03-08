import dropdownIcon from "../assets/dropdown.png";
import "./node.css";
import timeIcon from "../assets/time.png";
import deathsIcon from "../assets/deaths.png";

import React, { useRef, useState, type ReactNode } from "react";
import NodeList from "./nodeList";
import { formatTime } from "../utils";
import {
	getChildPaths,
	getParentPath,
	type NodeStats,
	type NodeStatType,
} from "./nodeTypes";
import { toast } from "react-toastify";
import { trace } from "@izumiano/vite-logger";
import localData from "../localData";
import LoadingSpinner from "../shared/loadingSpinner";
import { useCelesteStats } from "./celesteStatsContext";

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
	const [loadingState, setLoadingState] = useState<"finished" | "loading">(
		"finished",
	);
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

	const changeTitle = async (newTitle: string) => {
		if (newTitle === node.title) {
			return;
		}

		if (newTitle === "") {
			toast.error("Title must have at least one character");
			return;
		}

		setLoadingState("loading");

		const path = getParentPath(node);

		const oldName = `${path}${node.title}`;
		const newName = `${path}${newTitle}`;
		const mapNames = getChildPaths(node);

		trace({ oldName, newName, mapNames });

		const onFail = (reason: unknown) => {
			setLoadingState("finished");

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
					Failed changing name from <b>{node.title}</b> to{" "}
					<b>{titleRef.current}</b>
					<hr />
					<i>{message}</i>
				</span>,
			);
			titleRef.current = node.title;
		};

		fetch(
			`${localData.getCelesteStatsSrc()}/celesteSaves/database.php?q=changeMapName`,
			{ method: "POST", body: JSON.stringify({ oldName, newName, mapNames }) },
		)
			.then(async (response) => {
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

					return;
				}

				setLoadingState("finished");

				node.title = titleRef.current;
				refreshStats({ silent: true });
			})
			.catch((reason) => onFail(reason));
	};

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
				<div className="nodeInfo">
					{loadingState === "finished" && !node.isMode ? (
						<input
							defaultValue={titleRef.current}
							className="nodeTitle"
							onClick={(event) => {
								event.stopPropagation();
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
							{loadingState === "loading" && (
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
