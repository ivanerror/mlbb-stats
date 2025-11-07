"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Separator } from "@/components/ui/separator";
import {
  HERO_RANK_DEFAULT_QUERY,
  type HeroRankDays,
  type HeroRankTier,
} from "@/lib/api/mlbb";

const dayOptions: HeroRankDays[] = [1, 3, 7, 15, 30];
const rankOptions: HeroRankTier[] = [
  "all",
  "epic",
  "legend",
  "mythic",
  "honor",
  "glory",
];

interface HeroRankControlsProps {
  days: HeroRankDays;
  rank: HeroRankTier;
}

export function HeroRankControls({ days, rank }: HeroRankControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = React.useTransition();
  const [localDays, setLocalDays] = React.useState(days);
  const [localRank, setLocalRank] = React.useState(rank);

  React.useEffect(() => {
    setLocalDays(days);
  }, [days]);

  React.useEffect(() => {
    setLocalRank(rank);
  }, [rank]);

  const updateQuery = (
    patch: Partial<{ days: HeroRankDays; rank: HeroRankTier }>
  ) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (patch.days) params.set("days", String(patch.days));
    if (patch.rank) params.set("rank", patch.rank);
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  };

  const handleDaysChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value) as HeroRankDays;
    setLocalDays(value);
    updateQuery({ days: value });
  };

  const handleRankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as HeroRankTier;
    setLocalRank(value);
    updateQuery({ rank: value });
  };

  const handleReset = () => {
    setLocalDays(HERO_RANK_DEFAULT_QUERY.days);
    setLocalRank(HERO_RANK_DEFAULT_QUERY.rank);
    startTransition(() => {
      router.replace(pathname);
    });
  };

  return (
    <>
      <LoadingOverlay show={pending} message="Refreshing hero statistics..." />
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_15px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-white/60">
              Filters
            </p>
            <p className="text-sm text-white/65">
              Tune timeframe and rank tier to refine the live dataset.
            </p>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <label className="flex flex-col text-sm font-medium text-white/70">
              Timeframe
              <select
                value={localDays}
                onChange={handleDaysChange}
                disabled={pending}
                className="mt-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white shadow-inner shadow-black/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/60"
              >
                {dayOptions.map((option) => (
                  <option key={option} value={option}>
                    Last {option} day{option > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </label>
            <Separator className="hidden h-8 w-px bg-white/10 md:block" />
            <label className="flex flex-col text-sm font-medium text-white/70">
              Rank tier
              <select
                value={localRank}
                onChange={handleRankChange}
                disabled={pending}
                className="mt-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white shadow-inner shadow-black/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/60"
              >
                {rankOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={pending}
              className="text-white/70 hover:text-white"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
