import "./statsPage.css";

import { useEffect, useId, useState } from "react";
import { useCelesteStats } from "../shared/celesteStatsContext";
import NodeList from "./nodeList";
import Header from "./header";
import { useHeaderContext } from "../shared/header";
import { trace } from "@izumiano/vite-logger";
import MapsList from "./mapsList";

export default function StatsPage() {
	trace("StatsPage");
	const { saveData, filter, setFilter } = useCelesteStats();
	const { setChildren: setHeaderChildren } = useHeaderContext();

	const [searchQuery, setSearchQuery] = useState(
		sessionStorage.getItem("searchQuery") ?? "",
	);

	const id = useId();

	useEffect(() => {
		setHeaderChildren(
			<Header
				saveData={saveData}
				initialSearch={searchQuery}
				setSearchQuery={setSearchQuery}
				filter={filter}
				setFilter={setFilter}
			/>,
		);
	}, [saveData, setHeaderChildren, filter, searchQuery, setFilter]);

	return (
		<main className="main">
			{filter.layoutType === "campaigns" ? (
				<NodeList
					parentId={id}
					stats={saveData?.levelSetStats?.children}
					expanded={true}
					filter={filter}
					searchQuery={searchQuery}
				/>
			) : (
				<MapsList
					stats={saveData?.levelSetStats}
					filter={filter}
					searchQuery={searchQuery}
				/>
			)}
		</main>
	);
}
