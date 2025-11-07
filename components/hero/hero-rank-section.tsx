"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { HeroRateScatter } from "@/components/hero/hero-rate-scatter";
import { HeroRegionFilters } from "@/components/hero/hero-region-filters";
import {
  HERO_REGION_KEYS,
  type HeroRegionKey,
  buildChartData,
  average,
  getRegionKey,
} from "@/components/hero/hero-rate-scatter";
import type { HeroRankRow } from "@/lib/api/types";

interface HeroRankSectionProps {
  columns: ColumnDef<HeroRankRow, unknown>[];
  data: HeroRankRow[];
  emptyMessage?: string;
}

export function HeroRankSection({
  columns,
  data,
  emptyMessage,
}: HeroRankSectionProps) {
  const [highlightId, setHighlightId] = React.useState<number | undefined>();
  const [selectedRegions, setSelectedRegions] = React.useState<HeroRegionKey[]>(
    [...HERO_REGION_KEYS]
  );

  const handleRowSelect = React.useCallback((row?: HeroRankRow) => {
    setHighlightId((prev) =>
      prev === row?.main_heroid ? undefined : row?.main_heroid
    );
  }, []);

  const handleRegionChange = React.useCallback((regions: HeroRegionKey[]) => {
    setSelectedRegions(regions);
  }, []);

  // Filter data based on selected regions
  const filteredData = React.useMemo(() => {
    if (selectedRegions.length === 0) {
      return [];
    }

    if (selectedRegions.length === HERO_REGION_KEYS.length) {
      return data;
    }

    const chartData = buildChartData(data);
    const pickValues = chartData.map((datum) => datum.pickRate);
    const winValues = chartData.map((datum) => datum.winRate);
    const pickAverage = average(pickValues);
    const winAverage = average(winValues);

    if (typeof pickAverage !== "number" || typeof winAverage !== "number") {
      return data;
    }

    const selectedRegionSet = new Set(selectedRegions);

    return data.filter((record) => {
      const pickRate = (record.main_hero_appearance_rate ?? 0) * 100;
      const winRate = (record.main_hero_win_rate ?? 0) * 100;

      const region = getRegionKey(
        {
          id: record.main_heroid,
          hero: record.main_hero?.data?.name ?? `Hero ${record.main_heroid}`,
          pickRate,
          winRate,
          banRate: (record.main_hero_ban_rate ?? 0) * 100,
        },
        pickAverage,
        winAverage
      );

      return !region || selectedRegionSet.has(region);
    });
  }, [data, selectedRegions]);

  return (
    <div className="space-y-6">
      <HeroRegionFilters
        selectedRegions={selectedRegions}
        onRegionChange={handleRegionChange}
      />
      <HeroRateScatter
        data={data}
        highlightId={highlightId}
        visibleRegions={selectedRegions}
      />
      <DataTable
        columns={columns}
        data={filteredData}
        emptyMessage={emptyMessage}
        onRowSelect={handleRowSelect}
        selectedRowId={highlightId}
      />
    </div>
  );
}
