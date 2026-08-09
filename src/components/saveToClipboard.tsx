import type { ReactNode } from "react";
import { copyToClipboard } from "../utils";
import { toast } from "react-toastify";

export default function SaveToClipboard({
	value,
	className,
	children,
}: {
	value: unknown;
	className?: string;
	children: ReactNode;
}) {
	return (
		<div
			className={className}
			onClick={async () => {
				const result = await copyToClipboard(`${value}`);
				if (result.failed) {
					toast.error("Failed copying to clipboard");
					return;
				}
				toast("Copied to clipboard");
			}}
		>
			{children}
		</div>
	);
}
