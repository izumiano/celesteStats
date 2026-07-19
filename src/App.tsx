import { ToastContainer } from "react-toastify";

import "./reset.css";
import "./App.css";
import { StrictMode, useState, type ReactNode } from "react";
import localData from "./localData";
import CelesteStatsSrcPage from "./celesteStatsSrcPage";
import CelesteStatsContext from "./shared/celesteStatsContext";
import { HeaderContext } from "./shared/header";

export default function App({ children }: { children: ReactNode }) {
	const [celesteStatsSrc, setCelesteStatsSrc] = useState(
		localData.getCelesteStatsSrc(),
	);

	return (
		<StrictMode>
			<HeaderContext>
				{celesteStatsSrc ? (
					<CelesteStatsContext celesteStatsSrc={celesteStatsSrc}>
						{children}
					</CelesteStatsContext>
				) : (
					<CelesteStatsSrcPage setCelesteStatsSrc={setCelesteStatsSrc} />
				)}
			</HeaderContext>
			<ToastContainer position="bottom-left" />
		</StrictMode>
	);
}
