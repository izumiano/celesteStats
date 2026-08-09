import { ToastContainer } from "react-toastify";

import "./reset.css";
import "./App.css";
import { StrictMode, useState, type ReactNode } from "react";
import localData from "./localData";
import CelesteStatsSrcPage from "./celesteStatsSrcPage";
import CelesteStatsContext, {
	type StatsFilter,
} from "./shared/celesteStatsContext";
import { HeaderContext } from "./shared/header";
import RefreshStatsButton from "./shared/refreshStatsButton";

export default function App({ children }: { children: ReactNode }) {
	const [celesteStatsSrc, setCelesteStatsSrc] = useState(
		localData.getCelesteStatsSrc(),
	);

	const statsFilterState = useState<StatsFilter>(
		localData.getStatsFilter() ?? {
			type: "current",
			sortBy: { type: "title", direction: "descending" },
			showCleared: true,
			showUncleared: true,
		},
	);

	return (
		<StrictMode>
			<HeaderContext>
				{celesteStatsSrc ? (
					<CelesteStatsContext
						celesteStatsSrc={celesteStatsSrc}
						filterState={statsFilterState}
					>
						{children}
						<RefreshStatsButton />
					</CelesteStatsContext>
				) : (
					<CelesteStatsSrcPage setCelesteStatsSrc={setCelesteStatsSrc} />
				)}
			</HeaderContext>
			<ToastContainer position="bottom-left" />
		</StrictMode>
	);
}
