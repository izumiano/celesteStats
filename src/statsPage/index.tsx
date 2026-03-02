import "./statsPage.css";

import { useId, useRef, useState } from "react";
import { formatTime } from "../utils";
import useCelesteStats from "./useCelesteStats";
import NodeList from "./nodeList";
import { sleepFor } from "../utils";

export default function StatsPage({
	celesteStatsSrc,
}: {
	celesteStatsSrc: string;
}) {
	const saveData = useCelesteStats(celesteStatsSrc);

	const [searchQuery, setSearchQuery] = useState("");
	const searchQueryAbortController = useRef(new AbortController());

	const id = useId();

	return (
		<div className="main">
			<header>
				<h1>
					Total Time:{" "}
					{saveData ? formatTime(saveData.levelSetStats.timePlayed) : "?"}
				</h1>
				<h1>Total Deaths: {saveData?.levelSetStats.deaths ?? "?"}</h1>
			</header>
			<label>
				Search
				<input
					onChange={async (event) => {
						searchQueryAbortController.current.abort();
						searchQueryAbortController.current = new AbortController();
						if (
							(await sleepFor(1000, searchQueryAbortController.current.signal))
								.wasAborted
						) {
							return;
						}
						setSearchQuery(event.target.value);
					}}
				/>
			</label>
			<NodeList
				parentId={id}
				stats={saveData?.levelSetStats.children}
				expanded={true}
				searchQuery={searchQuery}
			/>
		</div>
	);
}
