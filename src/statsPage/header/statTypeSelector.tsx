import "./statTypeSelector.css";

import { NodeStatTypeArray, type NodeStatType } from "../nodeTypes";
import { useId, type CSSProperties } from "react";
import { capitalizeFirstLetter } from "../../utils";

interface StatTypeSelectorCSS extends CSSProperties {
	"--selected-index": number;
}

export default function StatTypeSelector({
	statType,
	setStatType,
}: {
	statType: NodeStatType;
	setStatType: (
		arg: NodeStatType | ((prev: NodeStatType) => NodeStatType),
	) => void;
}) {
	const statType2 = statType.type;

	const selectedStatTypeIndex = NodeStatTypeArray.indexOf(statType2);

	const id = useId();

	return (
		<div
			className="statTypeSelector flex align-center"
			style={
				{ "--selected-index": selectedStatTypeIndex } as StatTypeSelectorCSS
			}
		>
			{NodeStatTypeArray.map((statType2, index) => {
				return (
					<button
						key={`${id}${statType2}`}
						className={index === selectedStatTypeIndex ? "selected" : ""}
						onClick={() => {
							setStatType((prev) => {
								return {
									type: statType2,
									includeUncompleted: prev.includeUncompleted,
								};
							});
						}}
					>
						{capitalizeFirstLetter(statType2)}
					</button>
				);
			})}
		</div>
	);
}
