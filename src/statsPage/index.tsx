import "./statsPage.css";

import { useEffect, useId, useState } from "react";
import { useCelesteStats } from "../shared/celesteStatsContext";
import NodeList from "./nodeList";
import type { NodeStatType } from "./nodeTypes";
import Header from "./header";
import { useHeaderContext } from "../shared/header";

export default function StatsPage() {
	const { saveData } = useCelesteStats();
	const { setChildren: setHeaderChildren } = useHeaderContext();

	const [searchQuery, setSearchQuery] = useState("");

	const [statType, setStatType] = useState<NodeStatType>("current");

	const id = useId();

	useEffect(() => {
		setHeaderChildren(
			<Header
				saveData={saveData}
				setSearchQuery={setSearchQuery}
				statType={statType}
				setStatType={setStatType}
			/>,
		);
	}, [saveData, setHeaderChildren, statType]);

	return (
		<main className="main">
			<NodeList
				parentId={id}
				stats={saveData?.levelSetStats?.children}
				expanded={true}
				statType={statType}
				searchQuery={searchQuery}
			/>
		</main>
	);
}
