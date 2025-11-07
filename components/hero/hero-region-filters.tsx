"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HERO_REGION_COLORS,
  HERO_REGION_KEYS,
  HERO_REGION_LABELS,
  type HeroRegionKey,
} from "@/components/hero/hero-rate-scatter";

interface HeroRegionFiltersProps {
  selectedRegions: HeroRegionKey[];
  onRegionChange: (regions: HeroRegionKey[]) => void;
}

export function HeroRegionFilters({
  selectedRegions,
  onRegionChange,
}: HeroRegionFiltersProps) {
  const handleRegionToggle = (region: HeroRegionKey) => {
    if (selectedRegions.includes(region)) {
      // Remove region if already selected
      onRegionChange(selectedRegions.filter((r) => r !== region));
    } else {
      // Add region if not selected
      onRegionChange([...selectedRegions, region]);
    }
  };

  const handleSelectAll = () => {
    onRegionChange([...HERO_REGION_KEYS]);
  };

  const handleClearAll = () => {
    onRegionChange([]);
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-2">
          {HERO_REGION_KEYS.map((region) => {
            const isSelected = selectedRegions.includes(region);
            return (
              <Button
                key={region}
                variant="ghost"
                onClick={() => handleRegionToggle(region)}
                className={`rounded-2xl border px-3 py-1.5 text-sm shadow-inner shadow-black/30 transition-all ${
                  isSelected
                    ? "border-white/30 bg-white/20 text-white"
                    : "border-white/10 bg-white/10 text-white/70 hover:bg-white/15"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: HERO_REGION_COLORS[region] }}
                  />
                  <span>{HERO_REGION_LABELS[region]}</span>
                </div>
              </Button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleSelectAll}
            disabled={selectedRegions.length === HERO_REGION_KEYS.length}
            className="text-white/70 hover:text-white"
          >
            All
          </Button>
          <Button
            variant="ghost"
            onClick={handleClearAll}
            disabled={selectedRegions.length === 0}
            className="text-white/70 hover:text-white"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
