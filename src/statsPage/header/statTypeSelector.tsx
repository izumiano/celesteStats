import "./statTypeSelector.css";

import { useId, type CSSProperties } from "react";
import { capitalizeFirstLetter } from "../../utils";
import {
	StatsFilterTypeArray,
	type StatsFilter,
} from "../../shared/celesteStatsContext";

interface StatTypeSelectorCSS extends CSSProperties {
	"--selected-index": number;
}

export default function StatTypeSelector({
	filter,
	setFilter,
}: {
	filter: StatsFilter;
	setFilter: (arg: StatsFilter | ((prev: StatsFilter) => StatsFilter)) => void;
}) {
	const statType = filter.type;

	const selectedStatTypeIndex = StatsFilterTypeArray.indexOf(statType);

	const id = useId();

	return (
		<div
			className="statTypeSelector flex align-center"
			style={
				{ "--selected-index": selectedStatTypeIndex } as StatTypeSelectorCSS
			}
		>
			{StatsFilterTypeArray.map((statType, index) => {
				return (
					<button
						key={`${id}${statType}`}
						className={index === selectedStatTypeIndex ? "selected" : ""}
						onClick={() => {
							setFilter((prev) => {
								return {
									...prev,
									type: statType,
								};
							});
						}}
					>
						{capitalizeFirstLetter(statType)}
					</button>
				);
			})}
		</div>
	);
}
