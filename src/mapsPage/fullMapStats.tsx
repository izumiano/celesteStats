import "./fullMapStats.css";
import "../statsPage/node.css";
import timeIcon from "../assets/time.png";
import deathsIcon from "../assets/deaths.png";

import { formatDate, formatTime } from "../utils";
import type { NodeStats } from "../statsPage/nodeTypes";
import type { ReactNode } from "react";
import SaveToClipboard from "../components/saveToClipboard";

export default function FullMapStats({
	node,
	showTitle,
}: {
	node: NodeStats;
	showTitle?: boolean;
}) {
	const stats = {
		time: {
			clear: node.clearTime,
			current: node.timePlayed,
			diff: node.timePlayed - node.clearTime,
		},
		deaths: {
			clear: node.clearDeaths,
			current: node.deaths,
			diff: node.deaths - node.clearDeaths,
		},
	};

	showTitle ??= true;

	return (
		<div className="stats">
			{showTitle && (
				<div className="full-width flex space-between align-center pad-left-large pad-right-large">
					<h3 className="pad-left pad-right">{node.title}</h3>
					<ClearDate node={node} unimportant={true} />
				</div>
			)}
			<div className="stat-main">
				<div>Current</div>
				<div>Clear</div>
				<div>Difference</div>
				<SingleStat value={stats.time.current} iconSrc={timeIcon}>
					{formatTime(stats.time.current)}
				</SingleStat>
				<SingleStat value={stats.time.clear} iconSrc={timeIcon}>
					{formatTime(stats.time.clear)}
				</SingleStat>
				<SingleStat value={stats.time.diff} iconSrc={timeIcon}>
					+{formatTime(stats.time.diff)}
				</SingleStat>
				<SingleStat value={stats.deaths.current} iconSrc={deathsIcon}>
					{stats.deaths.current}
				</SingleStat>
				<SingleStat value={stats.deaths.clear} iconSrc={deathsIcon}>
					{stats.deaths.clear}
				</SingleStat>
				<SingleStat value={stats.deaths.diff} iconSrc={deathsIcon}>
					+{stats.deaths.diff}
				</SingleStat>
			</div>
			{!showTitle && (
				<>
					<hr className="hor-divide" />
					<ClearDate node={node} unimportant={false} />
				</>
			)}
		</div>
	);
}

function SingleStat({
	value,
	iconSrc,
	children,
}: {
	value: unknown;
	children: ReactNode;
	iconSrc: string;
}) {
	return (
		<SaveToClipboard value={value} className="nodeStats">
			<img src={iconSrc} alt="time icon" width={20} height={20} />
			<span>{children}</span>
		</SaveToClipboard>
	);
}

function ClearDate({
	node,
	unimportant,
}: {
	node: NodeStats;
	unimportant: boolean;
}) {
	return (
		node.clearDate != null && (
			<SaveToClipboard
				value={node.clearDate}
				dropdownAlignment={unimportant ? "right" : "center"}
			>
				<span
					className={`${unimportant ? "unimportant" : ""} pad-right pad-left`}
				>
					Cleared{" "}
					{formatDate(new Date(node.clearDate * 1000), "dd mmm yyyy", null)}
				</span>
			</SaveToClipboard>
		)
	);
}
