import timeIcon from "../../assets/time.png";
import deathsIcon from "../../assets/deaths.png";
import magnifyingGlass from "../../assets/magnifyingGlass.png";
import removeIcon from "../../assets/remove.png";
import "./header.css";

import { useRef, useState } from "react";
import { formatTime, sleepFor } from "../../utils";
import type { NodeStatType, SaveData } from "../nodeTypes";
import StatTypeSelector from "./statTypeSelector";

export default function Header({
	saveData,
	setSearchQuery,
	statType,
	setStatType,
}: {
	saveData: SaveData | null;
	setSearchQuery: (query: string) => void;
	statType: NodeStatType;
	setStatType: (statType: NodeStatType) => void;
}) {
	const searchQueryAbortController = useRef(new AbortController());
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [showRemoveSearchButton, setShowRemoveSearchButton] = useState(false);

	const time = (() => {
		if (!saveData) {
			return null;
		}

		switch (statType) {
			case "clear":
				return saveData.levelSetStats.clearTime;
			case "current":
				return saveData.levelSetStats.timePlayed;
			case "diff":
				return (
					saveData.levelSetStats.timePlayed - saveData.levelSetStats.clearTime
				);
		}
	})();

	const deaths = (() => {
		if (!saveData) {
			return null;
		}

		switch (statType) {
			case "clear":
				return saveData.levelSetStats.clearDeaths;
			case "current":
				return saveData.levelSetStats.deaths;
			case "diff":
				return (
					saveData.levelSetStats.deaths - saveData.levelSetStats.clearDeaths
				);
		}
	})();

	return (
		<header className="header flex space-between align-center flex-wrap">
			<h2>
				<div className="flex align-center">
					<img src={timeIcon} alt="time icon" width={25} height={25} />
					{statType === "diff" ? "+" : ""}
					{time != null ? formatTime(time) : "?"}
				</div>
				<div className="flex align-center">
					<img src={deathsIcon} alt="deaths icon" width={25} height={25} />
					{statType === "diff" ? "+" : ""}
					{deaths ?? "?"}
				</div>
			</h2>

			<div className="flex align-center flex-wrap">
				<label className="flex align-center">
					<input
						ref={searchInputRef}
						type="text"
						onChange={async (event) => {
							setShowRemoveSearchButton(event.target.value !== "");

							searchQueryAbortController.current.abort();
							searchQueryAbortController.current = new AbortController();
							if (
								(
									await sleepFor(
										1000,
										searchQueryAbortController.current.signal,
									)
								).wasAborted
							) {
								return;
							}
							setSearchQuery(event.target.value);
						}}
					/>
					<button
						className={`removeSearchButton ${showRemoveSearchButton ? "" : "no-pointer"}`}
						onClick={(event) => {
							event.preventDefault();
							if (searchInputRef.current) {
								searchInputRef.current.value = "";
							}
							setSearchQuery("");
							setShowRemoveSearchButton(false);
						}}
					>
						<img src={removeIcon} width={15} height={15} />
					</button>
					<img src={magnifyingGlass} width={25} height={25} />
				</label>

				<StatTypeSelector statType={statType} setStatType={setStatType} />
			</div>
		</header>
	);
}
