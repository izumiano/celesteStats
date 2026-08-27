import "./saveToClipboard.css";

import { useRef, type ReactNode } from "react";
import { copyToClipboard } from "../utils";
import { toast } from "react-toastify";
import Dropdown, { type Alignment } from "../shared/dropdown";

export default function SaveToClipboard({
	value,
	dropdownAlignment,
	className,
	children,
}: {
	value: unknown;
	dropdownAlignment?: Alignment;
	className?: string;
	children: ReactNode;
}) {
	const timeoutRef = useRef<number>(null);

	dropdownAlignment ??= "center";

	return (
		<Dropdown
			dropdownButton={children}
			onClick={async (_, {setIsOpen}) => {
				const result = await copyToClipboard(`${value}`);
				if (result.failed) {
					toast.error("Failed copying to clipboard");
					return;
				}
				
				setIsOpen(true);

				timeoutRef.current = setTimeout(() => {
					timeoutRef.current = null;
					setIsOpen(false);
				}, 1500);
			}}
			manualOpening
			onOpenChange={(isOpen, {setIsOpen}) => {
				setIsOpen(isOpen);
				if (timeoutRef.current != null) {
					clearTimeout(timeoutRef.current);
					timeoutRef.current = null;
				}
			}}
			buttonClass={`${className} unselectable pointer`}
			alignment={dropdownAlignment}
			direction="up"
			useDefaultButtonStyle={false}
			dropdownContentClassName="unselectable clipboard-dropdown"
		>
			<span className="padding">Copied to clipboard!</span>
		</Dropdown>
	);
}
