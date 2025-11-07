"use client";

import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import type { HeroRankRow } from "@/lib/api/types";

const formatPercent = (value?: number) =>
  typeof value === "number" ? `${(value * 100).toFixed(1)}%` : "--";

const formatNumber = (value?: number) =>
  typeof value === "number" ? `${value.toFixed(1)}` : "--";

const calculateMetaScore = (record: HeroRankRow) => {
  const winRate = record.main_hero_win_rate ?? 0;
  const pickRate = record.main_hero_appearance_rate ?? 0;
  const banRate = record.main_hero_ban_rate ?? 0;
  return (0.5 * winRate + 0.25 * pickRate + 0.25 * banRate) * 100;
};

const RELATION_SEGMENTS = [
  {
    key: "assist",
    label: "Assist",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  },
  {
    key: "strong",
    label: "Strong",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  },
  {
    key: "weak",
    label: "Weak",
    className: "border-rose-500/30 bg-rose-500/10 text-rose-200",
  },
] as const satisfies Array<{
  key: keyof NonNullable<HeroRankRow["relationTargets"]>;
  label: string;
  className: string;
}>;

const MAX_RELATION_BADGES = 3;

export const heroRankColumns: ColumnDef<HeroRankRow>[] = [
  {
    accessorKey: "main_hero",
    header: "Hero",
    enableSorting: false,
    cell: ({ row }) => {
      const hero = row.original.main_hero?.data;
      const name = hero?.name ?? `Hero ${row.original.main_heroid}`;
      const mediaSrc = hero?.head_big ?? hero?.head ?? hero?.smallmap;

      return (
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-muted/40">
            {mediaSrc ? (
              <Image
                src={mediaSrc}
                alt={name}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                {name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">
              ID {row.original.main_heroid}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "main_hero_win_rate",
    header: "Win Rate",
    cell: ({ row }) => (
      <Badge variant="success">
        {formatPercent(row.original.main_hero_win_rate)}
      </Badge>
    ),
  },
  {
    accessorKey: "main_hero_appearance_rate",
    header: "Pick Rate",
    cell: ({ row }) => formatPercent(row.original.main_hero_appearance_rate),
  },
  {
    accessorKey: "main_hero_ban_rate",
    header: "Ban Rate",
    cell: ({ row }) => formatPercent(row.original.main_hero_ban_rate),
  },
  {
    id: "meta_score",
    header: "Meta Score",
    accessorFn: (row) => calculateMetaScore(row),
    cell: ({ getValue }) => (
      <Badge variant="secondary">{formatNumber(getValue<number>())}</Badge>
    ),
  },
  {
    id: "relations",
    header: "Relations",
    enableSorting: false,
    cell: ({ row }) => {
      const targets = row.original.relationTargets;
      if (!targets) {
        return <span className="text-sm text-muted-foreground/70">--</span>;
      }

      return (
        <div className="max-w-[200px] space-y-2">
          {RELATION_SEGMENTS.map((segment) => {
            const items = targets[segment.key] ?? [];
            return (
              <div
                key={segment.key}
                className="flex flex-wrap items-center gap-1.5 text-xs"
              >
                <span className="font-medium text-foreground min-w-fit">
                  {segment.label}:
                </span>
                {items.length ? (
                  <div className="flex flex-wrap gap-1">
                    {items.slice(0, MAX_RELATION_BADGES).map((hero) => (
                      <Badge
                        key={`${segment.key}-${hero.id}`}
                        variant="outline"
                        className={`text-[10px] font-medium px-1.5 py-0.5 ${segment.className}`}
                      >
                        {hero.name}
                      </Badge>
                    ))}
                    {items.length > MAX_RELATION_BADGES ? (
                      <span className="text-[10px] text-muted-foreground/70 self-center">
                        +{items.length - MAX_RELATION_BADGES}
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-muted-foreground/60">--</span>
                )}
              </div>
            );
          })}
        </div>
      );
    },
  },
];
