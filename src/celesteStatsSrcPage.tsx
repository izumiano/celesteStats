import { useRef } from "react";
import localData from "./localData";

export default function CelesteStatsSrcPage({
	setCelesteStatsSrc,
}: {
	setCelesteStatsSrc: (src: string) => void;
}) {
	const inputTextRef = useRef("");

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();

				if (!inputTextRef.current) {
					return;
				}

				const src = inputTextRef.current.startsWith("https://")
					? inputTextRef.current
					: `https://${inputTextRef.current}`;

				localData.setCelesteStatsSrc(src);
				setCelesteStatsSrc(src);
			}}
		>
			<label>
				Enter ip of where celeste stats are coming from:{" "}
				<input
					onChange={(event) => {
						inputTextRef.current = event.target.value;
					}}
				/>
				<button type="submit">Submit</button>
			</label>
		</form>
	);
}
