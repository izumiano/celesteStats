import {
	StatsFilterTypeArray,
	type StatsFilter,
} from "../../shared/celesteStatsContext";
import Selector from "../../components/selector";

export default function StatTypeSelector({
	filter,
	setFilter,
}: {
	filter: StatsFilter;
	setFilter: (arg: StatsFilter | ((prev: StatsFilter) => StatsFilter)) => void;
}) {
	const statType = filter.type;
	return (
		<Selector
			selected={statType}
			onSelectedChange={(a) =>
				setFilter((prev) => {
					return {
						...prev,
						type: a,
					};
				})
			}
		>
			{[...StatsFilterTypeArray]}
		</Selector>
	);
}
