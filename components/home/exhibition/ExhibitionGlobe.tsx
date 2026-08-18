"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AmbientLight, DirectionalLight } from "three";
import Globe, { type GlobeMethods } from "react-globe.gl";
import type { ExhibitionCity } from "@/lib/server/public-media";

const RESUME_AFTER_RELEASE_MS = 2500;

const DUBAI = { lat: 25.2048, lng: 55.2708 };
const HOME_VIEW = { ...DUBAI, altitude: 2.0 };

function isDubai(lat: number, lon: number): boolean {
  return Math.abs(lat - DUBAI.lat) < 0.6 && Math.abs(lon - DUBAI.lng) < 0.6;
}

function markerSize(workCount: number): number {
  return 14 + Math.sqrt(workCount) * 7;
}

function buildMarker(city: ExhibitionCity): HTMLDivElement {
  const el = document.createElement("div");
  const size = markerSize(city.works.length);
  el.style.cssText = `position:relative;width:0;height:0;pointer-events:auto;cursor:pointer;`;
  el.innerHTML =
    `<span class="hm-globe-ring" style="position:absolute;left:50%;top:50%;width:${size}px;height:${size}px;` +
    `margin:${-size / 2}px 0 0 ${-size / 2}px;border:1px solid rgba(255,255,255,0.7);border-radius:50%;` +
    `box-shadow:0 0 6px rgba(0,0,0,0.5);transition:border-color .2s,transform .2s;"></span>` +
    `<span style="position:absolute;left:50%;top:50%;width:5px;height:5px;margin:-2.5px 0 0 -2.5px;` +
    `border-radius:50%;background:#fff;box-shadow:0 0 8px rgba(0,0,0,0.7);"></span>`;

  const label = document.createElement("span");
  label.className = "hm-globe-label";
  label.textContent = city.city;
  label.style.cssText =
    `position:absolute;left:${size / 2 + 6}px;top:-8px;white-space:nowrap;font-size:12px;font-weight:600;` +
    `letter-spacing:0.01em;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,0.98),0 0 3px rgba(0,0,0,0.95);` +
    `transition:opacity .2s;pointer-events:none;`;
  el.appendChild(label);
  return el;
}

function buildHomeMarker(): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText = `position:relative;width:0;height:0;pointer-events:none;`;
  el.innerHTML =
    `<span class="hm-globe-ping" style="position:absolute;left:50%;top:50%;width:26px;height:26px;` +
    `border:1px solid rgba(255,255,255,0.9);border-radius:50%;"></span>` +
    `<span style="position:absolute;left:50%;top:50%;width:22px;height:22px;margin:-11px 0 0 -11px;` +
    `border:1.5px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(0,0,0,0.6);"></span>` +
    `<span style="position:absolute;left:50%;top:50%;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;` +
    `border-radius:50%;background:#fff;box-shadow:0 0 10px rgba(255,255,255,0.9);"></span>` +
    `<span style="position:absolute;left:18px;top:-15px;display:flex;align-items:center;gap:5px;white-space:nowrap;">` +
    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" ` +
    `stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 1px 3px rgba(0,0,0,0.95))">` +
    `<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>` +
    `<span style="font-size:13px;font-weight:700;color:#fff;` +
    `text-shadow:0 1px 4px rgba(0,0,0,0.98),0 0 3px rgba(0,0,0,0.95)">Dubai</span>` +
    `<span style="font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;` +
    `color:rgba(255,255,255,0.85);text-shadow:0 1px 3px rgba(0,0,0,0.95)">Home base</span>` +
    `</span>`;
  return el;
}

type GlobeDatum =
  | { kind: "home"; lat: number; lon: number }
  | { kind: "city"; lat: number; lon: number; city: ExhibitionCity };

export default function ExhibitionGlobe({
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
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);
  const markers = useRef(new Map<string, HTMLDivElement>());
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const arcs = useMemo(
    () => cities.filter((c) => !isDubai(c.lat, c.lon)),
    [cities]
  );

  const markerData = useMemo<GlobeDatum[]>(
    () => [
      { kind: "home", lat: DUBAI.lat, lon: DUBAI.lng },
      ...cities.map((c) => ({ kind: "city" as const, lat: c.lat, lon: c.lon, city: c })),
    ],
    [cities]
  );

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const measure = () => {
      const w = Math.round(node.clientWidth);
      if (w > 0) setSize({ width: w, height: Math.min(w, 640) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const controls = globe.controls();
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;

    const stop = () => {
      controls.autoRotate = false;
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
    const resume = () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      resumeTimer.current = setTimeout(() => {
        controls.autoRotate = true;
      }, RESUME_AFTER_RELEASE_MS);
    };
    controls.addEventListener("start", stop);
    controls.addEventListener("end", resume);
    return () => {
      controls.removeEventListener("start", stop);
      controls.removeEventListener("end", resume);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, [cities]);

  useEffect(() => {
    markers.current.forEach((el, id) => {
      const on = id === hoveredId;
      const ring = el.querySelector<HTMLElement>(".hm-globe-ring");
      if (ring) {
        ring.style.borderColor = on ? "#fff" : "rgba(255,255,255,0.7)";
        ring.style.transform = on ? "scale(1.18)" : "scale(1)";
      }
      const label = el.querySelector<HTMLElement>(".hm-globe-label");
      if (label) label.style.fontWeight = on ? "800" : "600";
    });
  }, [hoveredId]);

  const handleReady = () => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.pointOfView(HOME_VIEW, 0);
    const directional = new DirectionalLight(0xffffff, 1.2);
    directional.position.set(1, 1, 1);
    globe.lights([new AmbientLight(0xffffff, 3), directional]);
  };

  return (
    <div ref={wrapRef} className="w-full">
      {size.width > 0 ? (
        <Globe
          ref={globeRef}
          onGlobeReady={handleReady}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="/globe/earth-day.jpg"
          bumpImageUrl="/globe/earth-topology.png"
          showAtmosphere
          atmosphereColor="#cdd6e4"
          atmosphereAltitude={0.18}
          arcsData={arcs as unknown as object[]}
          arcStartLat={() => DUBAI.lat}
          arcStartLng={() => DUBAI.lng}
          arcEndLat={(d: object) => (d as ExhibitionCity).lat}
          arcEndLng={(d: object) => (d as ExhibitionCity).lon}
          arcColor={() => ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.85)"]}
          arcStroke={0.5}
          arcAltitudeAutoScale={0.4}
          arcDashLength={0.5}
          arcDashGap={0.25}
          arcDashAnimateTime={3000}
          htmlElementsData={markerData as unknown as object[]}
          htmlLat={(d: object) => (d as GlobeDatum).lat}
          htmlLng={(d: object) => (d as GlobeDatum).lon}
          htmlElement={(d: object) => {
            const datum = d as GlobeDatum;
            if (datum.kind === "home") return buildHomeMarker();
            const city = datum.city;
            const el = buildMarker(city);
            el.addEventListener("mouseenter", () => onHover(city.locationId));
            el.addEventListener("mouseleave", () => onHover(null));
            el.addEventListener("click", () => onSelect(city));
            markers.current.set(city.locationId, el);
            return el;
          }}
          htmlElementVisibilityModifier={(el: HTMLElement, isVisible: boolean) => {
            el.style.opacity = isVisible ? "1" : "0";
            el.style.pointerEvents = isVisible ? "auto" : "none";
          }}
        />
      ) : null}
    </div>
  );
}
