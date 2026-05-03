import "../statsPage/node.css";
import timeIcon from "../assets/time.png";
import deathsIcon from "../assets/deaths.png";

import { useRef } from "react";
import { formatTime } from "../utils";
import type { NodeStats, NodeStatType } from "../statsPage/nodeTypes";
import type { GoldBerriesChapter } from "./mapPage";

export default function SingleNode({
	node,
	statType,
	goldBerriesChapter,
}: {
	node: NodeStats;
	id: string;
	statType: NodeStatType;
	searchQuery: string;
	goldBerriesChapter: GoldBerriesChapter | null;
}) {
	const titleRef = useRef(node.title);

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

	return (
		<div className={`node`}>
			<div className="nodeHeader">
				<div className="nodeInfo">
					<div className="flex alignItems">
						<div className="flex">
							<h2 className="nodeTitle">{titleRef.current}</h2>
						</div>
						<div
							className="mapLinks flex"
							onClick={(event) => event.stopPropagation()}
						>
							{goldBerriesChapter && (
								<>
									<a
										href={`https://goldberries.net/map/${goldBerriesChapter.id}`}
										target="_blank"
										rel="noopener noreferrer"
										className="flex mapLink"
									>
										<img
											src="https://goldberries.net/favicon-32x32.png"
											alt="goldberries link"
											width={20}
											height={20}
										/>
									</a>
									<a
										href={goldBerriesChapter.campaign.url}
										target="_blank"
										rel="noopener noreferrer"
										className="padLeft padRight flex mapLink"
									>
										<img
											src="https://images.gamebanana.com/static/img/favicon/favicon.ico"
											alt="gamebanana link"
											width={20}
											height={20}
										/>
									</a>
								</>
							)}
						</div>
					</div>
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
			</div>
		</div>
	);
}
