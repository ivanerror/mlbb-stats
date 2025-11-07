import { DEFAULT_REVALIDATE_SECONDS, MLBB_STATS_BASE_URL } from "./config";

export class MlbbStatsError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "MlbbStatsError";
  }
}

export interface ApiFetchOptions extends RequestInit {
  /**
   * Shorthand for `new URLSearchParams(searchParams)` appended to the request.
   */
  searchParams?: Record<string, string | number | boolean | undefined>;
  /**
   * Revalidation window for Next.js caching. Defaults to `DEFAULT_REVALIDATE_SECONDS`.
   */
  revalidate?: number | false;
  /**
   * Optional cache tags for Next.js' Cache API.
   */
  tags?: string[];
}

type NextFetchConfig = {
  revalidate?: number | false;
  tags?: string[];
};

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const buildUrl = (path: string, searchParams?: ApiFetchOptions["searchParams"]) => {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = isAbsoluteUrl(path)
    ? new URL(path)
    : new URL(normalizedPath, MLBB_STATS_BASE_URL);

  if (searchParams) {
    const params = new URLSearchParams(url.search);
    Object.entries(searchParams).forEach(([key, rawValue]) => {
      if (rawValue === undefined || rawValue === null) return;
      params.set(key, String(rawValue));
    });
    url.search = params.toString();
  }

  return url;
};

const isEnvelope = (value: unknown): value is { code?: number; message?: string } =>
  typeof value === "object" && value !== null && "code" in value;

export const mlbbFetch = async <T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> => {
  const { searchParams, revalidate = DEFAULT_REVALIDATE_SECONDS, tags, headers, ...init } =
    options;

  const url = buildUrl(path, searchParams);
  const nextConfig: NextFetchConfig = {};
  if (typeof revalidate !== "undefined") {
    nextConfig.revalidate = revalidate;
  }
  if (tags && tags.length) {
    nextConfig.tags = tags;
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers: {
      accept: "application/json",
      ...headers,
    },
    next: Object.keys(nextConfig).length ? nextConfig : undefined,
  });

  if (!response.ok) {
    const body = await safeParseJson(response);
    throw new MlbbStatsError(
      `MLBB Stats request failed (${response.status})`,
      response.status,
      body,
    );
  }

  const payload = (await safeParseJson(response)) as unknown;

  if (isEnvelope(payload)) {
    const code = payload.code ?? 0;
    if (![0, 200].includes(code)) {
      throw new MlbbStatsError(payload.message ?? "MLBB Stats error", code, payload);
    }
  }

  return payload as T;
};

const safeParseJson = async (response: Response) => {
  try {
    return await response.clone().json();
  } catch {
    return null;
  }
};
