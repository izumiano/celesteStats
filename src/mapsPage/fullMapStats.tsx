import "./fullMapStats.css";
import "../statsPage/node.css";
import timeIcon from "../assets/time.png";
import deathsIcon from "../assets/deaths.png";

import { formatTime } from "../utils";
import type { NodeStats } from "../statsPage/nodeTypes";

export default function FullMapStats({ node }: { node: NodeStats }) {
	const stats = {
		time: {
			clear: node.statsWithUncompleted.clearTime,
			current: node.statsWithUncompleted.timePlayed,
			diff:
				node.statsWithUncompleted.timePlayed -
				node.statsWithUncompleted.clearTime,
		},
		deaths: {
			clear: node.statsWithUncompleted.clearDeaths,
			current: node.statsWithUncompleted.deaths,
			diff:
				node.statsWithUncompleted.deaths -
				node.statsWithUncompleted.clearDeaths,
		},
	};

	return (
		<div className="stats">
			<div>Current</div>
			<div>Clear</div>
			<div>Difference</div>
			<div className="flex align-center nodeStats">
				<img src={timeIcon} alt="time icon" width={20} height={20} />
				<span>{formatTime(stats.time.current)}</span>
			</div>
			<div className="flex align-center nodeStats">
				<img src={timeIcon} alt="time icon" width={20} height={20} />
				<span>{formatTime(stats.time.clear)}</span>
			</div>
			<div className="flex align-center nodeStats">
				<img src={timeIcon} alt="time icon" width={20} height={20} />
				<span>+{formatTime(stats.time.diff)}</span>
			</div>
			<div className="flex align-center nodeStats">
				<img src={deathsIcon} alt="deaths icon" width={20} height={20} />
				<span>{stats.deaths.current}</span>
			</div>
			<div className="flex align-center nodeStats">
				<img src={deathsIcon} alt="deaths icon" width={20} height={20} />
				<span>{stats.deaths.clear}</span>
			</div>
			<div className="flex align-center nodeStats">
				<img src={deathsIcon} alt="deaths icon" width={20} height={20} />
				<span>+{stats.deaths.diff}</span>
			</div>
			{/* <div className="nodeInfo">
				<div className="nodeStats">
					<div className="flex align-center">
						<img src={timeIcon} alt="time icon" width={20} height={20} />
						<span>
							{stats.time.clear != null ? formatTime(stats.time.clear) : "?"}
						</span>
					</div>
					<div className="flex align-center">
						<img src={deathsIcon} alt="deaths icon" width={20} height={20} />
						<span>{stats.deaths.clear ?? "?"}</span>
					</div>
				</div>
			</div> */}
		</div>
	);
}
