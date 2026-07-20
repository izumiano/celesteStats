import { useCelesteStats } from "./celesteStatsContext";
import "./refreshStatsButton.css";
import refreshImg from "../assets/refresh.png";
import { useEffect, useState } from "react";
import { parseTimeAgo } from "../utils";
import type { SaveData } from "../statsPage/nodeTypes";

function getTimeAgo(saveData: SaveData) {
	const now = Date.now();

	const timeSince = saveData.timestamp ? now - saveData.timestamp : 0;
	return parseTimeAgo(timeSince);
}

export default function RefreshStatsButton() {
	const { refreshStats, saveData } = useCelesteStats();
	const [disabled, setDisabled] = useState(false);
	const [timeAgo, setTimeAgo] = useState(getTimeAgo(saveData));

	useEffect(() => {
		setTimeAgo(getTimeAgo(saveData));
	}, [saveData.timestamp, saveData]);

	return (
		<div className="refresh flex column align-end fixed bottom right padding">
			<button
				onClick={async () => {
					setDisabled(true);
					await refreshStats({ silent: false });
					setDisabled(false);
				}}
				disabled={disabled}
			>
				<img width={40} height={40} src={refreshImg} />
			</button>
			<span className="unimportant">
				{timeAgo.value} {timeAgo.unit} ago
			</span>
		</div>
	);
}
