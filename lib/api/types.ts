export interface ApiEnvelope<TData, TMeta = Record<string, unknown>> {
  code: number;
  message?: string;
  status?: string;
  data: TData;
  meta?: TMeta;
}

export interface WrappedRecord<T> {
  data: T;
}

export interface HeroMedia {
  head?: string;
  head_big?: string;
  name?: string;
  smallmap?: string;
}

export interface HeroAvatar {
  data: HeroMedia;
}

export interface HeroRelationEntry {
  desc?: string;
  target_hero_id: number[];
  target_hero?: HeroAvatar[];
}

export interface HeroRelationSet {
  assist: HeroRelationEntry;
  strong: HeroRelationEntry;
  weak: HeroRelationEntry;
}

export interface HeroListRecord {
  hero_id: number;
  hero: HeroAvatar;
  relation: HeroRelationSet;
}

export type HeroListResponse = ApiEnvelope<{
  records: Array<WrappedRecord<HeroListRecord>>;
  total?: number;
}>;

export interface HeroRankSubHero {
  hero_channel?: {
    id: number;
  };
  hero: HeroAvatar;
  heroid: number;
  increase_win_rate: number;
}

export interface HeroRankRecord {
  main_hero: HeroAvatar;
  main_hero_appearance_rate: number;
  main_hero_ban_rate: number;
  main_hero_channel?: {
    id: number;
  };
  main_hero_win_rate: number;
  main_heroid: number;
  sub_hero: HeroRankSubHero[];
}

export type HeroRankResponse = ApiEnvelope<{
  records: Array<WrappedRecord<HeroRankRecord>>;
  total?: number;
}>;

export interface HeroRelationTarget {
  id: number;
  name: string;
}

export type HeroRelationTargetSet = {
  assist: HeroRelationTarget[];
  strong: HeroRelationTarget[];
  weak: HeroRelationTarget[];
};

export type HeroRankRow = HeroRankRecord & {
  relation?: HeroRelationSet;
  relationTargets?: HeroRelationTargetSet;
};

export interface MplStanding {
  rank: number;
  team_name: string;
  team_logo: string;
  match_point: number;
  match_wl: string;
  net_game_win: number;
  game_wl: string;
}
