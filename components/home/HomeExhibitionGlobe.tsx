"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import MediaLightbox from "@/components/media/MediaLightbox";
import type { MediaItem } from "@/components/media/types";
import { useModalNavbarLock } from "@/components/media/useModalNavbarLock";
import type { ExhibitionCity } from "@/lib/server/public-media";
import { ExhibitionCityIndex } from "./exhibition/ExhibitionCityIndex";
import { ExhibitionCityModal } from "./exhibition/ExhibitionCityModal";

const ExhibitionGlobe = dynamic(() => import("./exhibition/ExhibitionGlobe"), {
  ssr: false,
});

export function HomeExhibitionGlobe({ cities }: { cities: ExhibitionCity[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [openCity, setOpenCity] = useState<ExhibitionCity | null>(null);
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);

  useModalNavbarLock(Boolean(openCity || activeItem));

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || inView) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [inView]);

  if (cities.length === 0) return null;

  return (
    <section ref={sectionRef} className="section-shell border-t border-border pt-12 sm:pt-16">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Where the work has shown</h2>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(150px,180px)_1fr] lg:items-center">
        <div className="order-2 lg:order-1">
          <ExhibitionCityIndex
            cities={cities}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onSelect={setOpenCity}
          />
        </div>

        <div className="order-1 min-h-[380px] sm:min-h-[560px] lg:order-2">
          {inView ? (
            <ExhibitionGlobe
              cities={cities}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onSelect={setOpenCity}
            />
          ) : null}
        </div>
      </div>

      {openCity ? (
        <ExhibitionCityModal
          city={openCity}
          onSelectItem={setActiveItem}
          onClose={() => setOpenCity(null)}
        />
      ) : null}

      {activeItem ? (
        <MediaLightbox active={activeItem} onClose={() => setActiveItem(null)} />
      ) : null}
    </section>
  );
}
