import { useId } from "react";
import { formatTime } from "./utils";
import useCelesteStats from "./useCelesteStats";
import NodeList from "./nodeList";

export default function StatsPage({
	celesteStatsSrc,
}: {
	celesteStatsSrc: string;
}) {
	const saveData = useCelesteStats(celesteStatsSrc);

	const id = useId();

	return (
		<div>
			<header>
				<h1>
					Total Time:{" "}
					{saveData ? formatTime(saveData.levelSetStats.timePlayed) : "?"}
				</h1>
				<h1>Total Deaths: {saveData?.levelSetStats.deaths ?? "?"}</h1>
			</header>
			<NodeList parentId={id} stats={saveData?.levelSetStats.children} />
		</div>
	);
}
