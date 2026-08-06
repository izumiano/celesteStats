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
	initialSearch,
	setSearchQuery: setSearchQueryState,
	statType,
	setStatType,
}: {
	saveData: SaveData | null;
	initialSearch: string;
	setSearchQuery: (query: string) => void;
	statType: NodeStatType;
	setStatType: (statType: NodeStatType) => void;
}) {
	const searchQueryAbortController = useRef(new AbortController());
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [showRemoveSearchButton, setShowRemoveSearchButton] = useState(
		initialSearch !== "",
	);

	const setSearchQuery = (query: string) => {
		sessionStorage.setItem("searchQuery", query);
		setSearchQueryState(query);
	};

	const time = (() => {
		if (!saveData?.levelSetStats) {
			return null;
		}

		switch (statType) {
			case "clear":
				return saveData.levelSetStats?.clearTime;
			case "current":
				return saveData.levelSetStats.timePlayed;
			case "diff":
				return (
					saveData.levelSetStats.timePlayed - saveData.levelSetStats.clearTime
				);
		}
	})();

	const deaths = (() => {
		if (!saveData?.levelSetStats) {
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
		<div className="flex align-center flex-wrap flex-grow">
			<h2 className="flex-grow">
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

			<label className="flex align-center searchBar">
				<input
					ref={searchInputRef}
					defaultValue={initialSearch}
					type="text"
					onChange={async (event) => {
						setShowRemoveSearchButton(event.target.value !== "");

						searchQueryAbortController.current.abort();
						searchQueryAbortController.current = new AbortController();
						if (
							(await sleepFor(1000, searchQueryAbortController.current.signal))
								.wasAborted
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
							searchInputRef.current.focus();
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
	);
}
