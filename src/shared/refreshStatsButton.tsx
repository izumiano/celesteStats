import { useCelesteStats } from "./celesteStatsContext";
import "./refreshStatsButton.css";
import refreshImg from "../assets/refresh.png";
import { useState } from "react";

export default function RefreshStatsButton() {
	const { refreshStats } = useCelesteStats();
	const [disabled, setDisabled] = useState(false);

	return (
		<button
			onClick={async () => {
				setDisabled(true);
				await refreshStats({ silent: false });
				setDisabled(false);
			}}
			className="refresh fixed bottom right padding"
			disabled={disabled}
		>
			<img width={40} height={40} src={refreshImg} />
		</button>
	);
}
