export const MLBB_ENDPOINTS = {
  hero: {
    list: "hero-list/",
    rank: "hero-rank/",
    position: "hero-position/",
    detail: (heroId: number | string) => `hero-detail/${heroId}/`,
    detailStats: (heroId: number | string) => `hero-detail-stats/${heroId}/`,
    skillCombo: (heroId: number | string) => `hero-skill-combo/${heroId}/`,
    rate: (heroId: number | string) => `hero-rate/${heroId}/`,
    relation: (heroId: number | string) => `hero-relation/${heroId}/`,
    counter: (heroId: number | string) => `hero-counter/${heroId}/`,
    compatibility: (heroId: number | string) => `hero-compatibility/${heroId}/`,
  },
  mplId: {
    standings: "mplid/standings/",
    teams: "mplid/teams/",
    teamDetail: (teamId: number | string) => `mplid/teams/${teamId}/`,
    transfers: "mplid/transfers/",
    teamStats: "mplid/team-stats/",
    playerStats: "mplid/player-stats/",
    heroStats: "mplid/hero-stats/",
    heroPools: "mplid/hero-pools/",
    playerPools: "mplid/player-pools/",
    standingsMvp: "mplid/standings-mvp/",
    schedule: "mplid/schedule/",
    scheduleWeek: (week: number | string) => `mplid/schedule/week/${week}/`,
    scheduleAllWeeks: "mplid/schedule/week/",
  },
  tools: {
    winRate: "win-rate/",
  },
} as const;

export type MlbbEndpoint = string | ((...args: never[]) => string);
