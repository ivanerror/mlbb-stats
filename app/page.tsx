import { HeroRankControls } from "@/components/hero/hero-rank-controls";
import { heroRankColumns } from "@/components/hero/hero-rank-columns";
import { HeroRankSection } from "@/components/hero/hero-rank-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  HERO_RANK_DEFAULT_QUERY,
  type HeroRankDays,
  type HeroRankTier,
  getHeroList,
  getHeroRankings,
} from "@/lib/api/mlbb";
import type {
  HeroListRecord,
  HeroRankRecord,
  HeroRankRow,
  HeroRelationEntry,
  HeroRelationTargetSet,
} from "@/lib/api/types";

type PageSearchParams = Record<string, string | string[] | undefined>;

const dayOptions: HeroRankDays[] = [1, 3, 7, 15, 30];
const rankOptions: HeroRankTier[] = [
  "all",
  "epic",
  "legend",
  "mythic",
  "honor",
  "glory",
];

const asSingle = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const parseDays = (value?: string): HeroRankDays => {
  const numeric = Number(value);
  return dayOptions.includes(numeric as HeroRankDays)
    ? (numeric as HeroRankDays)
    : HERO_RANK_DEFAULT_QUERY.days;
};

const parseRank = (value?: string): HeroRankTier =>
  rankOptions.includes(value as HeroRankTier)
    ? (value as HeroRankTier)
    : HERO_RANK_DEFAULT_QUERY.rank;

const applyHeroName = (
  map: Map<number, string>,
  rawId: number | undefined,
  name?: string
) => {
  const heroId = Number(rawId);
  if (!Number.isFinite(heroId) || heroId <= 0) {
    return;
  }

  if (name) {
    map.set(heroId, name);
    return;
  }

  if (!map.has(heroId)) {
    map.set(heroId, `Hero ${heroId}`);
  }
};

const buildHeroNameMap = (
  rankRecords: HeroRankRecord[],
  heroList: HeroListRecord[]
) => {
  const map = new Map<number, string>();

  heroList.forEach((hero) => {
    applyHeroName(map, hero.hero_id, hero.hero?.data?.name);

    const relations = [
      hero.relation?.assist,
      hero.relation?.strong,
      hero.relation?.weak,
    ];
    relations.forEach((entry) => {
      entry?.target_hero_id?.forEach((rawId, index) => {
        const heroId = Number(rawId);
        const name = entry?.target_hero?.[index]?.data?.name;
        applyHeroName(map, heroId, name);
      });
    });
  });

  rankRecords.forEach((record) => {
    applyHeroName(map, record.main_heroid, record.main_hero?.data?.name);
    record.sub_hero?.forEach((subHero) => {
      applyHeroName(map, subHero?.heroid, subHero?.hero?.data?.name);
    });
  });

  return map;
};

const mapRelationTargets = (
  entry: HeroRelationEntry | undefined,
  heroNameMap: Map<number, string>
) => {
  if (!entry?.target_hero_id?.length) {
    return [];
  }

  const seen = new Set<number>();

  return entry.target_hero_id
    .map((rawId, index) => {
      const heroId = Number(rawId);
      if (!Number.isFinite(heroId) || heroId <= 0 || seen.has(heroId)) {
        return null;
      }
      seen.add(heroId);
      const fallbackName = entry.target_hero?.[index]?.data?.name;
      return {
        id: heroId,
        name: heroNameMap.get(heroId) ?? fallbackName ?? `Hero ${heroId}`,
      };
    })
    .filter((value): value is { id: number; name: string } => value !== null);
};

const buildRelationTargetSet = (
  relation: HeroRankRow["relation"],
  heroNameMap: Map<number, string>
): HeroRelationTargetSet | undefined => {
  if (!relation) {
    return undefined;
  }

  const targetSet: HeroRelationTargetSet = {
    assist: mapRelationTargets(relation.assist, heroNameMap),
    strong: mapRelationTargets(relation.strong, heroNameMap),
    weak: mapRelationTargets(relation.weak, heroNameMap),
  };

  const hasTargets =
    targetSet.assist.length || targetSet.strong.length || targetSet.weak.length;

  return hasTargets ? targetSet : undefined;
};

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<PageSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedDays = parseDays(asSingle(resolvedSearchParams?.days));
  const selectedRank = parseRank(asSingle(resolvedSearchParams?.rank));

  const [heroRankings, heroList] = await Promise.all([
    getHeroRankings({
      query: {
        days: selectedDays,
        rank: selectedRank,
        size: 130,
      },
    }),
    getHeroList(),
  ]);

  const relationMap = new Map(
    heroList.heroes.map((hero) => [hero.hero_id, hero.relation])
  );
  const heroNameMap = buildHeroNameMap(heroRankings.rankings, heroList.heroes);

  const rankingsWithRelations: HeroRankRow[] = heroRankings.rankings.map(
    (record) => {
      const relation = relationMap.get(record.main_heroid);
      return {
        ...record,
        relation,
        relationTargets: buildRelationTargetSet(relation, heroNameMap),
      };
    }
  );

  const lastUpdated = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  return (
    <div className="min-h-screen text-white">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 lg:py-16">
        <header className="rounded-[2.5rem] border border-white/10 bg-white/5 px-6 py-10 shadow-[0_35px_120px_rgba(2,6,23,0.65)] backdrop-blur-xl lg:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                <Badge className="rounded-full border-green-400/50 bg-green-400/20 px-4 tracking-[0.4em] text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-pulse">
                  MLBB Analytics
                </Badge>
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">
                  Real-time hero intelligence
                </h1>
                <p className="text-base text-white/70">
                  Powered by{" "}
                  <a
                    href="https://mlbb-stats.ridwaanhall.com/"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    mlbb-stats.ridwaanhall.com
                  </a>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/65">
                <span>Last sync: {lastUpdated}</span>
                <Separator className="h-4 w-px bg-white/15" />
                <span>Cache window: 15 minutes</span>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-6">
          <HeroRankControls days={selectedDays} rank={selectedRank} />
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/60">
                Hero rankings
              </p>
              <p className="text-xl font-semibold text-white">
                {heroRankings.total} entries · timeframe {selectedDays} day
                {selectedDays > 1 ? "s" : ""} · tier {selectedRank}
              </p>
            </div>
            <HeroRankSection
              columns={heroRankColumns}
              data={rankingsWithRelations}
              emptyMessage="No hero data for this filter."
            />
          </div>
        </section>
      </main>
    </div>
  );
}
