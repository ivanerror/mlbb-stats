const DEFAULT_BASE_URL = "https://mlbb-stats.ridwaanhall.com/api";

/**
 * Normalized MLBB Stats API base URL. Allows overriding via
 * `NEXT_PUBLIC_MLBB_STATS_API_URL` while preserving a trailing slash.
 */
export const MLBB_STATS_BASE_URL = (() => {
  const fromEnv = process.env.NEXT_PUBLIC_MLBB_STATS_API_URL;
  const normalized = (fromEnv ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  return `${normalized}/`;
})();

/**
 * Default ISR window for remote MLBB resources (15 minutes).
 * Individual queries can override this via the `revalidate` option.
 */
export const DEFAULT_REVALIDATE_SECONDS = 60 * 15;
