import "./statsPage.css";

import { useId, useState } from "react";
import { useCelesteStats } from "./celesteStatsContext";
import NodeList from "./nodeList";
import type { NodeStatType } from "./nodeTypes";
import Header from "./header";

export default function StatsPage() {
	const { saveData } = useCelesteStats();

	const [searchQuery, setSearchQuery] = useState("");

	const [statType, setStatType] = useState<NodeStatType>("current");

	const id = useId();

	return (
		<>
			<Header
				saveData={saveData}
				setSearchQuery={setSearchQuery}
				statType={statType}
				setStatType={setStatType}
			/>

			<main className="main">
				<NodeList
					parentId={id}
					stats={saveData?.levelSetStats.children}
					expanded={true}
					statType={statType}
					searchQuery={searchQuery}
				/>
			</main>
		</>
	);
}
