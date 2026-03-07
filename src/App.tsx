import StatsPage from "./statsPage";
import { ToastContainer } from "react-toastify";

import "./reset.css";
import "./App.css";
import { useState } from "react";
import localData from "./localData";
import CelesteStatsSrcPage from "./celesteStatsSrcPage";
import CelesteStatsContext from "./statsPage/celesteStatsContext";

export default function App() {
	const [celesteStatsSrc, setCelesteStatsSrc] = useState(
		localData.getCelesteStatsSrc(),
	);

	return (
		<div>
			{celesteStatsSrc ? (
				<CelesteStatsContext celesteStatsSrc={celesteStatsSrc}>
					<StatsPage />
				</CelesteStatsContext>
			) : (
				<CelesteStatsSrcPage setCelesteStatsSrc={setCelesteStatsSrc} />
			)}
			<ToastContainer position="bottom-left" />
		</div>
	);
}
