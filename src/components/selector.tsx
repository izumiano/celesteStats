import { capitalizeFirstLetter } from "../utils";
import "./selector.css";

import { useId, type CSSProperties } from "react";

interface InternalStatTypeSelectorCSS {
	"--selected-index": number;
}

interface StatTypeSelectorCSS extends CSSProperties {
	"--button-width"?: string;
	"--anim-time"?: string;
}

type CombinedStatTypeSelectorCSS = StatTypeSelectorCSS &
	InternalStatTypeSelectorCSS;

export default function Selector<TValue extends string>({
	selected,
	onSelectedChange,
	customCss,
	children,
}: {
	selected: TValue;
	onSelectedChange: (arg: TValue) => void;
	customCss?: StatTypeSelectorCSS;
	children: TValue[];
}) {
	const values = Array.isArray(children) ? children : Object.keys(children);
	const selectedIndex = values.indexOf(selected);

	const id = useId();

	return (
		<div
			className="selector flex align-center"
			style={
				{
					...customCss,
					"--selected-index": selectedIndex,
				} as CombinedStatTypeSelectorCSS
			}
		>
			{values.map((valueOpt, index) => {
				return (
					<button
						key={`${id}${valueOpt}`}
						className={index === selectedIndex ? "selected" : ""}
						onClick={() => {
							onSelectedChange(valueOpt as TValue);
						}}
					>
						{capitalizeFirstLetter(valueOpt)}
					</button>
				);
			})}
		</div>
	);
}
