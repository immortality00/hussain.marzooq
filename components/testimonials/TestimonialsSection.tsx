"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { PublicTestimonial } from "@/lib/server/testimonials";

type GeoPoint = {
  key: string;
  label: string;
  count: number;
  lat: number;
  lon: number;
};

type ProjectedPoint = GeoPoint & {
  x: number;
  y: number;
  visible: boolean;
  scale: number;
};

const LOCATION_COORDINATES: Record<string, { lat: number; lon: number; label: string }> = {
  dubai: { lat: 25.2048, lon: 55.2708, label: "Dubai" },
  "dubai uae": { lat: 25.2048, lon: 55.2708, label: "Dubai" },
  uae: { lat: 23.4241, lon: 53.8478, label: "UAE" },
  "united arab emirates": { lat: 23.4241, lon: 53.8478, label: "UAE" },
  "abu dhabi": { lat: 24.4539, lon: 54.3773, label: "Abu Dhabi" },
  bahrain: { lat: 26.0667, lon: 50.5577, label: "Bahrain" },
  manama: { lat: 26.2235, lon: 50.5876, label: "Manama" },
  riyadh: { lat: 24.7136, lon: 46.6753, label: "Riyadh" },
  jeddah: { lat: 21.4858, lon: 39.1925, label: "Jeddah" },
  doha: { lat: 25.2854, lon: 51.531, label: "Doha" },
  kuwait: { lat: 29.3759, lon: 47.9774, label: "Kuwait" },
  muscat: { lat: 23.588, lon: 58.3829, label: "Muscat" },
  london: { lat: 51.5072, lon: -0.1276, label: "London" },
  paris: { lat: 48.8566, lon: 2.3522, label: "Paris" },
  amsterdam: { lat: 52.3676, lon: 4.9041, label: "Amsterdam" },
  netherlands: { lat: 52.1326, lon: 5.2913, label: "Netherlands" },
  berlin: { lat: 52.52, lon: 13.405, label: "Berlin" },
  madrid: { lat: 40.4168, lon: -3.7038, label: "Madrid" },
  spain: { lat: 40.4637, lon: -3.7492, label: "Spain" },
  rome: { lat: 41.9028, lon: 12.4964, label: "Rome" },
  istanbul: { lat: 41.0082, lon: 28.9784, label: "Istanbul" },
  jordan: { lat: 30.5852, lon: 36.2384, label: "Jordan" },
  amman: { lat: 31.9539, lon: 35.9106, label: "Amman" },
  india: { lat: 20.5937, lon: 78.9629, label: "India" },
  delhi: { lat: 28.6139, lon: 77.209, label: "Delhi" },
  mumbai: { lat: 19.076, lon: 72.8777, label: "Mumbai" },
  "new york": { lat: 40.7128, lon: -74.006, label: "New York" },
  nyc: { lat: 40.7128, lon: -74.006, label: "NYC" },
  "new york city": { lat: 40.7128, lon: -74.006, label: "New York" },
  "los angeles": { lat: 34.0522, lon: -118.2437, label: "Los Angeles" },
  toronto: { lat: 43.6532, lon: -79.3832, label: "Toronto" },
  tokyo: { lat: 35.6762, lon: 139.6503, label: "Tokyo" },
  singapore: { lat: 1.3521, lon: 103.8198, label: "Singapore" },
  sydney: { lat: -33.8688, lon: 151.2093, label: "Sydney" },
};

const CONTINENT_PATHS = [
  "M191 203c34-49 92-75 148-58 38 12 72 42 113 39 37-3 62-31 100-24 25 5 47 22 58 45 15 31 5 69-17 95-26 31-64 44-104 46-43 2-81-12-123-19-49-8-89 22-137 11-55-13-78-86-38-135Z",
  "M223 363c42 31 84 24 129 32 50 9 78 51 121 70 39 17 93 16 121 51-62 39-155 37-232 8-82-31-136-88-139-161Z",
  "M539 164c51-36 122-42 183-21 66 23 116 76 122 143 6 60-32 107-78 142-41 31-77 64-133 65-57 1-97-42-116-92-18-49-6-90 7-135 10-36-12-73 15-102Z",
  "M656 403c36 5 62 30 91 48 35 22 72 31 92 69-54 29-125 18-169-27-30-31-43-66-14-90Z",
  "M741 188c40 5 73 30 94 65 25 42 21 87-8 121-20 24-51 39-83 29-34-11-41-48-50-79-13-46-2-103 47-136Z",
];

function normalizeLocation(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[,._-]+/g, " ")
    .replace(/\s+/g, " ");
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function fallbackCoordinates(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return {
    lat: -55 + (hash % 110),
    lon: -170 + ((hash >> 8) % 340),
  };
}

function resolveCoordinates(location: string) {
  const normalized = normalizeLocation(location);
  const exact = LOCATION_COORDINATES[normalized];

  if (exact) return exact;

  const partial = Object.entries(LOCATION_COORDINATES).find(([key]) => normalized.includes(key));

  if (partial) return partial[1];

  return {
    ...fallbackCoordinates(normalized),
    label: titleCase(location),
  };
}

function buildGeoPoints(items: PublicTestimonial[]): GeoPoint[] {
  const map = new Map<string, GeoPoint>();

  for (const item of items) {
    if (!item.location) continue;

    const key = normalizeLocation(item.location);
    if (!key) continue;

    const resolved = resolveCoordinates(item.location);
    const existing = map.get(key);

    if (existing) {
      existing.count += 1;
      continue;
    }

    map.set(key, {
      key,
      label: resolved.label,
      count: 1,
      lat: resolved.lat,
      lon: resolved.lon,
    });
  }

  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function getGeoPointForReview(item: PublicTestimonial) {
  if (!item.location) return null;

  const resolved = resolveCoordinates(item.location);

  return {
    key: normalizeLocation(item.location),
    label: resolved.label,
    count: 1,
    lat: resolved.lat,
    lon: resolved.lon,
  };
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function projectPoint(point: GeoPoint, rotationLon: number, rotationLat: number): ProjectedPoint {
  const lat = degreesToRadians(point.lat);
  const lon = degreesToRadians(point.lon - rotationLon);
  const tilt = degreesToRadians(rotationLat);

  const cosLat = Math.cos(lat);
  const x = cosLat * Math.sin(lon);
  const rawY = Math.sin(lat) * Math.cos(tilt) - cosLat * Math.cos(lon) * Math.sin(tilt);
  const z = Math.sin(lat) * Math.sin(tilt) + cosLat * Math.cos(lon) * Math.cos(tilt);

  return {
    ...point,
    x: 50 + x * 38,
    y: 50 - rawY * 38,
    visible: z > -0.08,
    scale: Math.max(0.6, Math.min(1.2, 0.8 + z * 0.35)),
  };
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => (index < rating ? "★" : "☆")).join("");
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function getIdentityLine(item: PublicTestimonial) {
  return [item.about, item.location].filter(Boolean).join(" • ") || "Client";
}

function Avatar({
  name,
  profilePhotoUrl,
  size = "card",
}: {
  name: string;
  profilePhotoUrl: string | null;
  size?: "card" | "modal";
}) {
  const sizeClass = size === "modal" ? "h-20 w-20 text-xl" : "h-12 w-12 text-sm";

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/70 ${sizeClass}`}
    >
      {profilePhotoUrl ? (
        <Image
          src={profilePhotoUrl}
          alt={name}
          fill
          className="object-cover"
          sizes={size === "modal" ? "80px" : "48px"}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-medium text-muted-foreground">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}

function ReviewPhotoStrip({ item }: { item: PublicTestimonial }) {
  const visiblePhotos = item.photoUrls.slice(0, 3);
  const hiddenPhotosCount = Math.max(0, item.photoUrls.length - visiblePhotos.length);

  if (visiblePhotos.length === 0) return null;

  return (
    <div className="mt-6 flex items-end gap-2 overflow-hidden">
      {visiblePhotos.map((url, index) => (
        <div
          key={url}
          className={`relative overflow-hidden rounded-[1rem] bg-muted ring-1 ring-border/60 ${
            index === 0 ? "h-24 w-20" : "h-16 w-16"
          }`}
        >
          <Image
            src={url}
            alt={`${item.name} review photo ${index + 1}`}
            fill
            className="object-cover"
            sizes="120px"
          />
        </div>
      ))}

      {hiddenPhotosCount > 0 ? (
        <div className="flex h-16 w-16 items-center justify-center rounded-[1rem] bg-foreground text-xs font-semibold text-background">
          +{hiddenPhotosCount}
        </div>
      ) : null}
    </div>
  );
}

function TestimonialGlobe({
  points,
  activePoint,
}: {
  points: GeoPoint[];
  activePoint: GeoPoint | null;
}) {
  const targetLon = activePoint?.lon ?? 55.2708;
  const targetLat = activePoint?.lat ?? 18;
  const projectedPoints = points.map((point) => projectPoint(point, targetLon, targetLat));
  const activeProjected = activePoint ? projectPoint(activePoint, targetLon, targetLat) : null;

  return (
    <section className="rounded-[1.5rem] border border-border/60 bg-muted/20 p-4 shadow-sm sm:p-5">
      <h2 className="max-w-xs text-xl font-semibold leading-tight tracking-[-0.045em] sm:text-2xl">
        Stories across the world.
      </h2>

      <div className="relative mx-auto mt-4 aspect-square max-w-[390px] overflow-hidden rounded-full border border-border/70 bg-background shadow-[inset_0_-28px_70px_rgba(0,0,0,0.08)]">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_28%,rgba(255,255,255,0.96),rgba(255,255,255,0.12)_30%,rgba(0,0,0,0.08)_72%,rgba(0,0,0,0.18)_100%)]" />
        <div className="absolute inset-[7%] rounded-full border border-border/50" />
        <div className="absolute inset-[14%] rounded-full border border-border/35" />
        <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.07)_1px,transparent_1px)] [background-size:42px_42px]" />

        <svg
          viewBox="0 0 1000 580"
          role="img"
          aria-label="Animated globe map showing review locations"
          className="absolute inset-0 h-full w-full text-foreground/12 transition-transform duration-700 ease-out"
          style={{
            transform: `translateX(${-(targetLon / 180) * 12}px) translateY(${(targetLat / 90) * 7}px) scale(1.22)`,
          }}
          preserveAspectRatio="xMidYMid meet"
        >
          {CONTINENT_PATHS.map((path) => (
            <path key={path} d={path} fill="currentColor" />
          ))}
        </svg>

        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-border/70" />
        <div className="absolute inset-0 rounded-full shadow-[inset_-34px_-24px_80px_rgba(0,0,0,0.16),inset_22px_18px_60px_rgba(255,255,255,0.75)]" />

        {points.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm text-muted-foreground">
            Review locations will appear here.
          </div>
        ) : null}

        {projectedPoints.map((point) => (
          <div
            key={point.key}
            className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out ${
              point.visible ? "opacity-100" : "opacity-20"
            }`}
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              transform: `translate(-50%, -50%) scale(${point.scale})`,
            }}
          >
            <span className="absolute -inset-3 rounded-full bg-foreground/10" />
            <span className="relative block h-2.5 w-2.5 rounded-full bg-foreground shadow-[0_0_22px_rgba(0,0,0,0.35)]" />
          </div>
        ))}

        {activeProjected ? (
          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
            style={{
              left: `${activeProjected.x}%`,
              top: `${activeProjected.y}%`,
            }}
          >
            <span className="absolute -inset-5 animate-ping rounded-full bg-foreground/20" />
            <span className="relative block h-4 w-4 rounded-full bg-foreground ring-4 ring-background shadow-xl" />
          </div>
        ) : null}
      </div>

      <div className="mt-4 rounded-[1.15rem] border border-border/60 bg-background p-4">
        <div className="text-sm font-medium">
          {activePoint?.label ?? points[0]?.label ?? "No location yet"}
        </div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          {activePoint
            ? "The globe rotates toward the active review location."
            : "Add a city or country when submitting a review."}
        </div>
      </div>
    </section>
  );
}

function ReviewModal({
  item,
  onClose,
}: {
  item: PublicTestimonial;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] bg-black/55 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto mt-5 w-full max-w-6xl overflow-hidden rounded-[2rem] bg-background text-foreground shadow-2xl ring-1 ring-border/80"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border/60 p-5">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar name={item.name} profilePhotoUrl={item.profilePhotoUrl} size="card" />
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold tracking-[-0.03em]">{item.name}</div>
              <div className="mt-1 truncate text-sm text-muted-foreground">
                {getIdentityLine(item)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="max-h-[82vh] overflow-y-auto p-5 sm:p-7">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="space-y-6">
              <div className="text-xl text-amber-500">{renderStars(item.rating)}</div>

              <blockquote className="rounded-[1.5rem] border border-border/60 bg-muted/25 p-5 text-xl leading-9 tracking-[-0.02em] sm:text-2xl sm:leading-10">
                “{item.review}”
              </blockquote>
            </div>

            <div>
              {item.photoUrls.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {item.photoUrls.map((url, index) => (
                    <div
                      key={url}
                      className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[1.2rem] bg-muted/40 ring-1 ring-border/60"
                    >
                      <Image
                        src={url}
                        alt={`${item.name} review photo ${index + 1}`}
                        fill
                        className="object-contain"
                        sizes="520px"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-border/60 bg-muted/25 p-6 text-sm text-muted-foreground">
                  No photos attached to this review.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewPanel({
  item,
  isActive,
  onOpen,
  panelRef,
}: {
  item: PublicTestimonial;
  isActive: boolean;
  onOpen: (item: PublicTestimonial) => void;
  panelRef: (node: HTMLElement | null) => void;
}) {
  return (
    <article
      ref={panelRef}
      data-review-id={item.id}
      className="flex min-h-[520px] snap-start items-center rounded-[1.5rem] border border-border/60 bg-background p-5 shadow-sm sm:p-7 lg:min-h-[620px]"
    >
      <button type="button" onClick={() => onOpen(item)} className="block w-full text-left">
        <div className="flex items-start justify-between gap-5">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={item.name} profilePhotoUrl={item.profilePhotoUrl} />

            <div className="min-w-0">
              <div className="truncate text-sm font-medium tracking-[-0.01em]">{item.name}</div>
              <div className="mt-1 truncate text-xs text-muted-foreground">
                {getIdentityLine(item)}
              </div>
            </div>
          </div>

          <div className="shrink-0 text-sm tracking-[0.08em] text-amber-500">
            {renderStars(item.rating)}
          </div>
        </div>

        <blockquote
          className={`mt-10 text-balance font-medium leading-[1.06] tracking-[-0.065em] transition-opacity duration-300 ${
            isActive ? "opacity-100" : "opacity-65"
          } text-4xl sm:text-5xl lg:text-6xl`}
        >
          “{item.review}”
        </blockquote>

        <ReviewPhotoStrip item={item} />

        <div className="mt-8 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Read review
        </div>
      </button>
    </article>
  );
}

export default function TestimonialsSection({ items }: { items: PublicTestimonial[] }) {
  const [active, setActive] = useState<PublicTestimonial | null>(items[0] ?? null);
  const [modalItem, setModalItem] = useState<PublicTestimonial | null>(null);
  const panelRefs = useRef<Record<string, HTMLElement | null>>({});

  const points = useMemo(() => buildGeoPoints(items), [items]);
  const activePoint = useMemo(() => {
    if (!active) return points[0] ?? null;
    return getGeoPointForReview(active) ?? points[0] ?? null;
  }, [active, points]);

  useEffect(() => {
    if (modalItem) window.dispatchEvent(new Event("hm_modal_open"));
    else window.dispatchEvent(new Event("hm_modal_close"));
  }, [modalItem]);

  useEffect(() => {
    const nodes = Object.values(panelRefs.current).filter(Boolean) as HTMLElement[];

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!mostVisible) return;

        const reviewId = mostVisible.target.getAttribute("data-review-id");
        const nextActive = items.find((item) => item.id === reviewId);

        if (nextActive) setActive(nextActive);
      },
      {
        threshold: [0.45, 0.6, 0.75],
        rootMargin: "-20% 0px -20% 0px",
      }
    );

    for (const node of nodes) observer.observe(node);

    return () => observer.disconnect();
  }, [items]);

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(300px,0.78fr)_minmax(0,1.22fr)] lg:items-start">
        <div className="lg:sticky lg:top-20">
          <TestimonialGlobe points={points} activePoint={activePoint} />
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-10 bg-gradient-to-b from-background to-transparent" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-10 bg-gradient-to-t from-background to-transparent" />

          <div className="max-h-[calc(100vh-120px)] snap-y snap-mandatory space-y-5 overflow-y-auto pr-1 scroll-smooth">
            {items.map((item) => (
              <ReviewPanel
                key={item.id}
                item={item}
                isActive={active?.id === item.id}
                onOpen={setModalItem}
                panelRef={(node) => {
                  panelRefs.current[item.id] = node;
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {modalItem ? <ReviewModal item={modalItem} onClose={() => setModalItem(null)} /> : null}
    </>
  );
}