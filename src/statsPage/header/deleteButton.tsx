import "./deleteButton.css";
import binIcon from "../../assets/bin.png";

import { tryDeleteNode, type NodeStats } from "../nodeTypes";
import { useState } from "react";
import Dropdown from "../../shared/dropdown";
import LoadingSpinner from "../../shared/loadingSpinner";

export default function DeleteButton({
	node,
	refreshStats,
}: {
	node: NodeStats;
	refreshStats: (props: { silent: boolean }) => void;
}) {
	const [loadingState, setLoadingState] = useState<"finished" | "loading">(
		"finished",
	);

	return (
		<Dropdown
			dropdownButton={
				loadingState === "finished" ? (
					<img
						src={binIcon}
						alt="delete button"
						width={15}
						height={15}
						className="transparent75"
					/>
				) : (
					<LoadingSpinner props={{ centered: true, size: "8px" }} />
				)
			}
			className="deleteDropdown"
			buttonClass="deleteButton"
			buttonProps={{ disabled: loadingState === "loading" }}
			onClick={(event) => {
				event.stopPropagation();
			}}
			alignment="right"
		>
			{({ closeDropdown }) => (
				<div className="deleteConfirmation padding">
					<p>Are you sure you want to delete</p>
					<b>{node.title}</b>
					<div className="flex large-padding space-evenly">
						<button
							onClick={async () => {
								closeDropdown();

								setLoadingState("loading");

								// TODO: handle conflicts with names of children in this node and where they will be after this node is deleted
								const success = await tryDeleteNode(node);

								if (success) {
									refreshStats({ silent: true });
								}

								setLoadingState("finished");
							}}
							className="confirm"
						>
							Delete
						</button>
						<button onClick={closeDropdown}>Keep</button>
					</div>
				</div>
			)}
		</Dropdown>
	);
}
