"use client";

import type { ExhibitionCity } from "@/lib/server/public-media";

export function ExhibitionCityIndex({
  cities,
  hoveredId,
  onHover,
  onSelect,
}: {
  cities: ExhibitionCity[];
  hoveredId: string | null;
  onHover: (locationId: string | null) => void;
  onSelect: (city: ExhibitionCity) => void;
}) {
  return (
    <ul className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-1">
      {cities.map((city) => {
        const isHovered = hoveredId === city.locationId;

        return (
          <li key={city.locationId} className="border-t border-border">
            <button
              type="button"
              onMouseEnter={() => onHover(city.locationId)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(city.locationId)}
              onBlur={() => onHover(null)}
              onClick={() => onSelect(city)}
              className={`grid w-full grid-cols-[minmax(0,auto)_minmax(0.75rem,1fr)_auto] items-end py-2 text-left transition-colors ${
                isHovered ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <span className="truncate text-[0.78rem] leading-tight" title={city.city}>
                {city.city}
              </span>
              <span
                className={`mb-[0.28rem] border-b border-dotted transition-colors ${
                  isHovered ? "border-foreground/50" : "border-border"
                }`}
                aria-hidden
              />
              <span className="pl-2 font-mono text-[0.625rem] tabular-nums">
                {city.works.length}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
