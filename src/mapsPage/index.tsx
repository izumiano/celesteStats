import { useState } from "react";
import localData from "../localData";
import CelesteStatsContext from "../shared/celesteStatsContext";
import CelesteStatsSrcPage from "../celesteStatsSrcPage";
import { ToastContainer } from "react-toastify";
import MapPage from "./mapPage";
import "../index.css";
import "../reset.css";
import "../App.css";

export default function MapsPage() {
	const [celesteStatsSrc, setCelesteStatsSrc] = useState(
		localData.getCelesteStatsSrc(),
	);

	return (
		<div>
			{celesteStatsSrc ? (
				<CelesteStatsContext
					celesteStatsSrc={celesteStatsSrc}
					refreshStats={false}
				>
					<MapPage />
				</CelesteStatsContext>
			) : (
				<CelesteStatsSrcPage setCelesteStatsSrc={setCelesteStatsSrc} />
			)}
			<ToastContainer position="bottom-left" />
		</div>
	);
}
