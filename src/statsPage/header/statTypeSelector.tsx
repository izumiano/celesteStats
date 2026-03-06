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
	setStatType: (statType: NodeStatType) => void;
}) {
	const selectedStatTypeIndex = NodeStatTypeArray.indexOf(statType);

	const id = useId();

	return (
		<div
			className="statTypeSelector flex align-center"
			style={
				{ "--selected-index": selectedStatTypeIndex } as StatTypeSelectorCSS
			}
		>
			{NodeStatTypeArray.map((statType, index) => {
				return (
					<button
						key={`${id}${statType}`}
						className={index === selectedStatTypeIndex ? "selected" : ""}
						onClick={() => {
							setStatType(statType);
						}}
					>
						{capitalizeFirstLetter(statType)}
					</button>
				);
			})}
		</div>
	);
}
