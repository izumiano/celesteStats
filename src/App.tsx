import StatsPage from "./statsPage";
import { ToastContainer } from "react-toastify";

import "./reset.css";
import "./App.css";
import { useState } from "react";
import localData from "./localData";
import CelesteStatsSrcPage from "./celesteStatsSrcPage";

export default function App() {
	const [celesteStatsSrc, setCelesteStatsSrc] = useState(
		localData.getCelesteStatsSrc(),
	);

	return (
		<div>
			{celesteStatsSrc ? (
				<StatsPage celesteStatsSrc={celesteStatsSrc} />
			) : (
				<CelesteStatsSrcPage setCelesteStatsSrc={setCelesteStatsSrc} />
			)}
			<ToastContainer position="bottom-left" />
		</div>
	);
}
