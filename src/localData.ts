import {
	StatsFilterDefault,
	type StatsFilter,
} from "./shared/celesteStatsContext";

export const CELESTE_STATS_LOCAL_ID = "celesteStats";
const CELESTE_STATS_SRC_LOCAL_ID = "celesteStatsSrc";
const STATS_FILTER = "celesteStatsFilter";

const localData = {
	reset() {
		localStorage.removeItem(CELESTE_STATS_LOCAL_ID);
		localStorage.removeItem(CELESTE_STATS_SRC_LOCAL_ID);
		localStorage.removeItem(STATS_FILTER);
	},

	getLocalStats() {
		return localStorage.getItem(CELESTE_STATS_LOCAL_ID);
	},
	setLocalStats(stats: string) {
		localStorage.setItem(CELESTE_STATS_LOCAL_ID, stats);
	},

	getCelesteStatsSrc() {
		return localStorage.getItem(CELESTE_STATS_SRC_LOCAL_ID);
	},
	setCelesteStatsSrc(src: string) {
		localStorage.setItem(CELESTE_STATS_SRC_LOCAL_ID, src);
	},

	getStatsFilter() {
		const statsFilterStr = localStorage.getItem(STATS_FILTER);
		if (!statsFilterStr) {
			return StatsFilterDefault;
		}
		const filter = JSON.parse(statsFilterStr) as Partial<StatsFilter>;

		for (const _key of Object.keys(StatsFilterDefault)) {
			const key = _key as keyof typeof StatsFilterDefault;
			(filter[key] as unknown) ??= StatsFilterDefault[key];
		}

		return filter as StatsFilter;
	},
	setStatsFilter(filter: StatsFilter) {
		localStorage.setItem(STATS_FILTER, JSON.stringify(filter));
	},
};

export default localData;
