import timeIcon from "@assets/time.png";
import deathsIcon from "@assets/deaths.png";
import magnifyingGlass from "@assets/magnifyingGlass.png";
import removeIcon from "@assets/remove.png";
import filterIcon from "@assets/filter.png";
import "./header.css";

import { useId, useRef, useState } from "react";
import { capitalizeFirstLetter, formatTime, sleepFor } from "../../utils";
import type { SaveData } from "../nodeTypes";
import StatTypeSelector from "./statTypeSelector";
import {
	MapsLayoutTypeValues,
	StatsFilterSortByArray,
	type StatsFilter,
	type StatsFilterSortByType,
} from "../../shared/celesteStatsContext";
import Dropdown from "../../shared/dropdown";
import Selector from "../../components/selector";

export default function Header({
	saveData,
	initialSearch,
	setSearchQuery: setSearchQueryState,
	filter,
	setFilter,
}: {
	saveData: SaveData | null;
	initialSearch: string;
	setSearchQuery: (query: string) => void;
	filter: StatsFilter;
	setFilter: (arg: StatsFilter | ((prev: StatsFilter) => StatsFilter)) => void;
}) {
	const searchQueryAbortController = useRef(new AbortController());
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [showRemoveSearchButton, setShowRemoveSearchButton] = useState(
		initialSearch !== "",
	);
	const id = useId();

	const setSearchQuery = (query: string) => {
		sessionStorage.setItem("searchQuery", query);
		setSearchQueryState(query);
	};

	const time = (() => {
		if (!saveData?.levelSetStats) {
			return null;
		}

		switch (filter.type) {
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
		if (!saveData?.levelSetStats) {
			return null;
		}

		switch (filter.type) {
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
					{filter.type === "diff" ? "+" : ""}
					{time != null ? formatTime(time) : "?"}
				</div>
				<div className="flex align-center">
					<img src={deathsIcon} alt="deaths icon" width={25} height={25} />
					{filter.type === "diff" ? "+" : ""}
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

			<StatTypeSelector filter={filter} setFilter={setFilter} />

			<Dropdown
				dropdownButton={<img src={filterIcon} width={23} height={23} />}
				buttonClass="stat-filter-button"
				className="stat-filter"
				alignment="right"
			>
				<div className="stat-filter-content">
					<Selector
						selected={filter.layoutType}
						onSelectedChange={(layoutType) =>
							setFilter((prev) => {
								return {
									...prev,
									layoutType,
								};
							})
						}
						customCss={{ "--button-width": "9rem" }}
					>
						{[...MapsLayoutTypeValues]}
					</Selector>
					<label className="padding">
						Show Cleared
						<input
							type="checkbox"
							checked={filter.showCleared}
							onChange={() => {
								setFilter((prev) => {
									return { ...prev, showCleared: !prev.showCleared };
								});
							}}
						/>
					</label>
					<label className="padding">
						Show Uncleared
						<input
							type="checkbox"
							checked={filter.showUncleared}
							onChange={() => {
								setFilter((prev) => {
									return { ...prev, showUncleared: !prev.showUncleared };
								});
							}}
						/>
					</label>

					<div className="flex column">
						<span>Sort By:</span>
						<div className="flex align-center">
							<select
								className="flex-grow"
								defaultValue={filter.sortBy.type}
								onChange={(event) => {
									setFilter((prev) => {
										return {
											...prev,
											sortBy: {
												...prev.sortBy,
												type: event.target.value as StatsFilterSortByType,
											},
										};
									});
								}}
							>
								{StatsFilterSortByArray.map((sortBy) => (
									<option key={`${id}_${sortBy}`} value={sortBy}>
										{capitalizeFirstLetter(sortBy)}
									</option>
								))}
							</select>
							<label className="padding">
								Descending
								<input
									type="checkbox"
									checked={filter.sortBy.direction === "descending"}
									onChange={(event) => {
										setFilter((prev) => {
											return {
												...prev,
												sortBy: {
													...prev.sortBy,
													direction: event.target.checked
														? "descending"
														: "ascending",
												},
											};
										});
									}}
								/>
							</label>
						</div>
					</div>
				</div>
			</Dropdown>
		</div>
	);
}
