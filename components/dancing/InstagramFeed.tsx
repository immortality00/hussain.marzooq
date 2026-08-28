"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toInstagramEmbedUrl } from "@/lib/instagram";

export function InstagramFeed({ urls }: { urls: string[] }) {
  const embeds = useMemo(
    () => urls.map(toInstagramEmbedUrl).filter((u): u is string => u !== null),
    [urls],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== "https://www.instagram.com") return;
      let payload: unknown;
      try {
        payload = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (!payload || typeof payload !== "object") return;
      const { type, details } = payload as { type?: string; details?: { height?: number } };
      const height = Number(details?.height);
      if (type !== "MEASURE" || !height) return;
      const root = containerRef.current;
      if (!root) return;
      root.querySelectorAll("iframe").forEach((frame) => {
        if (frame.contentWindow === e.source) frame.style.height = `${height}px`;
      });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (embeds.length === 0) return null;

  return (
    <div ref={containerRef} className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {embeds.map((src, i) => (
        <div
          key={src}
          style={{ transitionDelay: revealed ? `${i * 90}ms` : "0ms" }}
          className={[
            "overflow-hidden rounded-[2rem] border bg-card shadow-[var(--shadow-soft)]",
            "transition-[opacity,translate] duration-[600ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] will-change-[opacity,translate] motion-reduce:transition-none",
            revealed ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          ].join(" ")}
        >
          <iframe
            src={src}
            title="Instagram post"
            loading="lazy"
            scrolling="no"
            style={{ height: 560 }}
            className="w-full border-0 align-top"
            allow="encrypted-media"
          />
        </div>
      ))}
    </div>
  );
}
