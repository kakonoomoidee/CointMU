import ms from "ms";

// Store
export const MAX_FOUND_BLOCKS = 500;
export const MAX_HASHRATE_HISTORY = 60;
export const MAX_MINING_LOGS = 200;

// Utils
export const DEFAULT_CONCURRENCY = 8;

// Hooks
export const STATS_POLL_INTERVAL_MS = ms("2s");
export const HASHES_PER_MEGAHASH = 1_000_000;
export const DAG_COMPLETE_PERCENT = 100;
export const STATS_POLL_INTERVAL_SECONDS = STATS_POLL_INTERVAL_MS / 1000;
export const ESTIMATED_HASHES_PER_THREAD = 500_000;
export const FALLBACK_BASE_LOAD = 0.2;

export const CONFIG_SYNC_INTERVAL_MS = ms("1s");

export const MAX_LOG_ENTRIES = 50;
export const LOG_TIME_FORMAT = "HH:mm:ss";
export const BLOCK_REWARD_LABEL = "2.00 CMU";

// Components
export const INTENSITY_OPTIONS = ["Eco", "Balanced", "Turbo"] as const;

export const FOUND_BLOCKS_PAGE_SIZE = 8;

export const BLOCK_REWARD_CMU = "2.00";

export const SELF_BLOCK_REWARD = "+2.00";
export const ACTIVITY_WINDOW_MS = ms("30d");
export const ACTIVITY_WINDOW_DAYS = 30;
export const SECONDS_TO_MS = 1000;

export const ACTIVITY_TAB_FOUND = "Found";
export const ACTIVITY_TAB_LOG = "Log";
export const ACTIVITY_TAB_ACTIVITY = "Activity";
export const ACTIVITY_TABS = [
  ACTIVITY_TAB_FOUND,
  ACTIVITY_TAB_LOG,
  ACTIVITY_TAB_ACTIVITY,
];

export const HEATMAP_INTENSITY_LEGEND = ['bg-slate-100', 'bg-green-200', 'bg-green-400', 'bg-green-600'];
export const HEATMAP_HALF_YEAR_LENGTH = 182;

