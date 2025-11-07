"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { HeroRateScatter } from "@/components/hero/hero-rate-scatter";
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

  const handleRowSelect = React.useCallback((row?: HeroRankRow) => {
    setHighlightId((prev) =>
      prev === row?.main_heroid ? undefined : row?.main_heroid
    );
  }, []);

  return (
    <div className="space-y-6">
      <HeroRateScatter data={data} highlightId={highlightId} />
      <DataTable
        columns={columns}
        data={data}
        emptyMessage={emptyMessage}
        onRowSelect={handleRowSelect}
        selectedRowId={highlightId}
      />
    </div>
  );
}
