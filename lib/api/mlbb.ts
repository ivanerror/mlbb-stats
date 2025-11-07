import { mlbbFetch, ApiFetchOptions } from "./client";
import { MLBB_ENDPOINTS } from "./endpoints";
import type {
  HeroListRecord,
  HeroListResponse,
  HeroRankRecord,
  HeroRankResponse,
  MplStanding,
  WrappedRecord,
} from "./types";

type GetOptions = Omit<ApiFetchOptions, "body" | "method">;

const unwrapRecords = <T>(records?: Array<WrappedRecord<T>>): T[] =>
  records?.map((record) => record.data) ?? [];

export type HeroRankDays = 1 | 3 | 7 | 15 | 30;
export type HeroRankTier = "all" | "epic" | "legend" | "mythic" | "honor" | "glory";
export type HeroRankSortField = "pick_rate" | "ban_rate" | "win_rate";
export type HeroRankSortOrder = "asc" | "desc";

export interface HeroRankQuery {
  days?: HeroRankDays;
  rank?: HeroRankTier;
  size?: number;
  index?: number;
  sortField?: HeroRankSortField;
  sortOrder?: HeroRankSortOrder;
}

export type HeroRankingsOptions = GetOptions & {
  /**
   * Structured query params applied to the hero rank endpoint.
   */
  query?: HeroRankQuery;
};

export const HERO_RANK_DEFAULT_QUERY: Required<HeroRankQuery> = {
  days: 1,
  rank: "all",
  size: 20,
  index: 1,
  sortField: "win_rate",
  sortOrder: "desc",
};

const buildHeroRankSearchParams = (
  query?: HeroRankQuery,
  searchParams?: GetOptions["searchParams"],
) => {
  const normalized = { ...HERO_RANK_DEFAULT_QUERY, ...query };
  return {
    days: normalized.days,
    rank: normalized.rank,
    size: normalized.size,
    index: normalized.index,
    sort_field: normalized.sortField,
    sort_order: normalized.sortOrder,
    ...searchParams,
  };
};

export interface HeroListResult {
  heroes: HeroListRecord[];
  total: number;
  raw: HeroListResponse;
}

export const getHeroList = async (options: GetOptions = {}): Promise<HeroListResult> => {
  const payload = await mlbbFetch<HeroListResponse>(MLBB_ENDPOINTS.hero.list, options);
  const heroes = unwrapRecords(payload.data.records);

  return {
    heroes,
    total: payload.data.total ?? heroes.length,
    raw: payload,
  };
};

export interface HeroRankResult {
  rankings: HeroRankRecord[];
  total: number;
  raw: HeroRankResponse;
}

export const getHeroRankings = async (
  options: HeroRankingsOptions = {},
): Promise<HeroRankResult> => {
  const { query, searchParams, ...requestOptions } = options;
  const payload = await mlbbFetch<HeroRankResponse>(MLBB_ENDPOINTS.hero.rank, {
    ...requestOptions,
    searchParams: buildHeroRankSearchParams(query, searchParams),
  });
  const rankings = unwrapRecords(payload.data.records);

  return {
    rankings,
    total: payload.data.total ?? rankings.length,
    raw: payload,
  };
};

export interface MplStandingsResult {
  standings: MplStanding[];
  raw: MplStanding[];
}

export const getMplStandings = async (
  options: GetOptions = {},
): Promise<MplStandingsResult> => {
  const payload = await mlbbFetch<MplStanding[]>(MLBB_ENDPOINTS.mplId.standings, options);

  return {
    standings: payload,
    raw: payload,
  };
};
