"use client";

import * as React from "react";
import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  Cell,
} from "recharts";
import type { TooltipContentProps } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HeroRankRow } from "@/lib/api/types";

export type ChartDatum = {
  id: number;
  hero: string;
  pickRate: number;
  winRate: number;
  banRate: number;
  region?: HeroRegionKey;
  fill?: string;
};

export const HERO_REGION_KEYS = [
  "highPickHighWin",
  "highPickLowWin",
  "lowPickHighWin",
  "lowPickLowWin",
] as const;

export type HeroRegionKey = (typeof HERO_REGION_KEYS)[number];

export const HERO_REGION_LABELS: Record<HeroRegionKey, string> = {
  highPickHighWin: "High Pick / High Win",
  highPickLowWin: "High Pick / Low Win",
  lowPickHighWin: "Low Pick / High Win",
  lowPickLowWin: "Low Pick / Low Win",
};

export const HERO_REGION_COLORS: Record<HeroRegionKey, string> = {
  highPickHighWin: "#34d399",
  highPickLowWin: "#fb7185",
  lowPickHighWin: "#60a5fa",
  lowPickLowWin: "#fbbf24",
};
const SCATTER_ANIMATION_MS = 400;
const HIGHLIGHT_ANIMATION_MS = 120;

const percentFormatter = (value?: number) =>
  typeof value === "number" ? `${value.toFixed(1)}%` : "--";

const expandDomain = (values: number[], padding = 1): [number, number] => {
  if (!values.length) {
    return [0, 100];
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  return [Math.max(min - padding, 0), max + padding];
};

export const average = (values: number[]) => {
  if (!values.length) {
    return undefined;
  }
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
};

export const getRegionKey = (
  datum: ChartDatum,
  pickAverage?: number,
  winAverage?: number
): HeroRegionKey | undefined => {
  if (typeof pickAverage !== "number" || typeof winAverage !== "number") {
    return undefined;
  }
  const pickHigh = datum.pickRate >= pickAverage;
  const winHigh = datum.winRate >= winAverage;

  if (pickHigh && winHigh) return "highPickHighWin";
  if (pickHigh && !winHigh) return "highPickLowWin";
  if (!pickHigh && winHigh) return "lowPickHighWin";
  return "lowPickLowWin";
};

export const buildChartData = (records: HeroRankRow[]): ChartDatum[] =>
  records
    .map((record) => {
      const pickRate = (record.main_hero_appearance_rate ?? 0) * 100;
      const winRate = (record.main_hero_win_rate ?? 0) * 100;
      const banRate = (record.main_hero_ban_rate ?? 0) * 100;

      return {
        id: record.main_heroid,
        hero: record.main_hero?.data?.name ?? `Hero ${record.main_heroid}`,
        pickRate,
        winRate,
        banRate,
      };
    })
    .filter(
      (datum) =>
        Number.isFinite(datum.pickRate) &&
        Number.isFinite(datum.winRate) &&
        Number.isFinite(datum.banRate)
    );

const tooltipRenderer = ({
  active,
  payload,
}: TooltipContentProps<number, string>) => {
  if (!active || !payload?.length) {
    return null;
  }

  const datum = payload[0]?.payload as ChartDatum | undefined;

  if (!datum) {
    return null;
  }

  return (
    <div className="space-y-1 rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
      <p className="text-sm font-semibold text-white">{datum.hero}</p>
      <p className="text-xs text-white/70">
        Pick Rate: {percentFormatter(datum.pickRate)}
      </p>
      <p className="text-xs text-white/70">
        Win Rate: {percentFormatter(datum.winRate)}
      </p>
      <p className="text-xs text-white/70">
        Ban Rate: {percentFormatter(datum.banRate)}
      </p>
    </div>
  );
};

interface HeroRateScatterProps {
  data: HeroRankRow[];
  highlightId?: number;
  visibleRegions?: HeroRegionKey[];
}

export function HeroRateScatter({
  data,
  highlightId,
  visibleRegions,
}: HeroRateScatterProps) {
  const chartData = React.useMemo<ChartDatum[]>(
    () => buildChartData(data),
    [data]
  );

  const pickDomain = React.useMemo<[number, number]>(() => {
    const values = chartData.map((datum) => datum.pickRate);
    return expandDomain(values);
  }, [chartData]);

  const winDomain = React.useMemo<[number, number]>(() => {
    const values = chartData.map((datum) => datum.winRate);
    return expandDomain(values);
  }, [chartData]);

  const pickAverage = React.useMemo(() => {
    const values = chartData.map((datum) => datum.pickRate);
    return average(values);
  }, [chartData]);

  const winAverage = React.useMemo(() => {
    const values = chartData.map((datum) => datum.winRate);
    return average(values);
  }, [chartData]);

  const visibleRegionSet = React.useMemo(() => {
    const source =
      visibleRegions === undefined ? HERO_REGION_KEYS : visibleRegions;
    return new Set<HeroRegionKey>(source);
  }, [visibleRegions]);

  const displayData = React.useMemo(() => {
    if (!chartData.length) {
      return [];
    }
    if (typeof pickAverage !== "number" || typeof winAverage !== "number") {
      return chartData;
    }

    return chartData.filter((datum) => {
      const region = getRegionKey(datum, pickAverage, winAverage);
      return !region || visibleRegionSet.has(region);
    });
  }, [chartData, pickAverage, winAverage, visibleRegionSet]);

  const regionAwareData = React.useMemo(() => {
    if (!displayData.length) {
      return [];
    }
    if (typeof pickAverage !== "number" || typeof winAverage !== "number") {
      return displayData;
    }
    return displayData.map((datum) => {
      const region = getRegionKey(datum, pickAverage, winAverage);
      if (!region) {
        return datum;
      }
      return {
        ...datum,
        region,
        fill: HERO_REGION_COLORS[region],
      };
    });
  }, [displayData, pickAverage, winAverage]);

  const highlightedDatum = React.useMemo(
    () => regionAwareData.find((datum) => datum.id === highlightId),
    [regionAwareData, highlightId]
  );

  return (
    <Card className="border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-transparent">
      <CardHeader className="pb-0">
        <CardTitle className="text-2xl">Pick vs Win Rate</CardTitle>
        <CardDescription className="text-white/70">
          Bubble size represents ban rate.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[420px] pt-6 lg:h-[460px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{
              top: 16,
              right: 24,
              bottom: 8,
              left: 8,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.25)"
            />
            <XAxis
              type="number"
              dataKey="pickRate"
              name="Pick Rate"
              tickFormatter={percentFormatter}
              domain={pickDomain}
              tick={{ fill: "#c7d2fe", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
              tickLine={{ stroke: "rgba(255,255,255,0.25)" }}
            />
            <YAxis
              type="number"
              dataKey="winRate"
              name="Win Rate"
              tickFormatter={percentFormatter}
              domain={winDomain}
              tick={{ fill: "#c7d2fe", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.25)" }}
              tickLine={{ stroke: "rgba(255,255,255,0.25)" }}
            />
            <ZAxis
              type="number"
              dataKey="banRate"
              name="Ban Rate"
              range={[40, 280]}
            />
            <Tooltip
              cursor={{
                strokeDasharray: "3 3",
                stroke: "rgba(148,163,184,0.5)",
              }}
              content={tooltipRenderer}
            />
            {typeof pickAverage === "number" ? (
              <ReferenceLine
                x={pickAverage}
                stroke="#f97316"
                strokeDasharray="4 4"
                label={{
                  value: "Pick Avg",
                  position: "top",
                  fill: "#fed7aa",
                  fontSize: 12,
                }}
              />
            ) : null}
            {typeof winAverage === "number" ? (
              <ReferenceLine
                y={winAverage}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{
                  value: "Win Avg",
                  position: "right",
                  fill: "#bbf7d0",
                  fontSize: 12,
                }}
              />
            ) : null}
            {typeof pickAverage === "number" &&
            typeof winAverage === "number" ? (
              <>
                <ReferenceArea
                  x1={pickDomain[0]}
                  x2={pickAverage}
                  y1={winAverage}
                  y2={winDomain[1]}
                  fill={HERO_REGION_COLORS.lowPickHighWin}
                  fillOpacity={0.12}
                  strokeOpacity={0}
                />
                <ReferenceArea
                  x1={pickAverage}
                  x2={pickDomain[1]}
                  y1={winAverage}
                  y2={winDomain[1]}
                  fill={HERO_REGION_COLORS.highPickHighWin}
                  fillOpacity={0.12}
                  strokeOpacity={0}
                />
                <ReferenceArea
                  x1={pickDomain[0]}
                  x2={pickAverage}
                  y1={winDomain[0]}
                  y2={winAverage}
                  fill={HERO_REGION_COLORS.lowPickLowWin}
                  fillOpacity={0.12}
                  strokeOpacity={0}
                />
                <ReferenceArea
                  x1={pickAverage}
                  x2={pickDomain[1]}
                  y1={winDomain[0]}
                  y2={winAverage}
                  fill={HERO_REGION_COLORS.highPickLowWin}
                  fillOpacity={0.12}
                  strokeOpacity={0}
                />
              </>
            ) : null}
            <Scatter
              data={regionAwareData}
              fill="#8b5cf6"
              fillOpacity={0.8}
              stroke="#c084fc"
              name="Heroes"
              animationDuration={SCATTER_ANIMATION_MS}
              animationEasing="ease-out"
              animationBegin={0}
              shape={(props: any) => {
                const { cx, cy, payload } = props;
                const isHighlighted = payload.id === highlightId;

                if (isHighlighted) {
                  return (
                    <g>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={10}
                        fill="#ef4444"
                        fillOpacity={1}
                        stroke="#f87171"
                        strokeWidth={3}
                      />
                    </g>
                  );
                }

                return (
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill={payload.fill || "#8b5cf6"}
                      fillOpacity={0.8}
                      stroke="#c084fc"
                      strokeWidth={1}
                    />
                  </g>
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
