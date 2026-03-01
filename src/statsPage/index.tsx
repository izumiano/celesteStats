import { useId } from "react";
import { formatTime } from "./utils";
import useCelesteStats from "./useCelesteStats";

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
			{saveData?.levelSetStats.children.map((node, index) => {
				return (
					<div key={id + node.title}>
						<h2>{`${index + 1} ${node.title}`}</h2>
						<span>{`Time: ${formatTime(node.timePlayed)}, Deaths: ${node.deaths}`}</span>
					</div>
				);
			})}
		</div>
	);
}
