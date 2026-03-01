export const CELESTE_STATS_LOCAL_ID = "celesteStats";
const CELESTE_STATS_SRC_LOCAL_ID = "celesteStatsSrc";

const localData = {
	reset() {
		localStorage.removeItem(CELESTE_STATS_LOCAL_ID);
		localStorage.removeItem(CELESTE_STATS_SRC_LOCAL_ID);
	},

	getLocalStats() {
		return localStorage.getItem(CELESTE_STATS_LOCAL_ID);
	},
	setLocalStats(stats: string) {
		return localStorage.setItem(CELESTE_STATS_LOCAL_ID, stats);
	},

	getCelesteStatsSrc() {
		return localStorage.getItem(CELESTE_STATS_SRC_LOCAL_ID);
	},
	setCelesteStatsSrc(src: string) {
		return localStorage.setItem(CELESTE_STATS_SRC_LOCAL_ID, src);
	},
};

export default localData;
