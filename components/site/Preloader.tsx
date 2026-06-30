"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const SESSION_KEY = "hm-preloader-shown";

// null = still loading, string[] = ready (may be empty — fallback colors used)
type ImagesState = string[] | null;

const FALLBACK_COLORS = ["#1a1a2e", "#16213e", "#0f3460", "#533483", "#1a1a2e"];

export function Preloader() {
  const [images, setImages] = useState<ImagesState>(null);
  const [done, setDone] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLSpanElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);

  // All sessionStorage access must be in useEffect (client-only)
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      setDone(true);
      return;
    }
    fetch("/api/preloader-images")
      .then((r) => r.json())
      .then((data) => {
        const urls = (data.images as { url: string }[]).map((i) => i.url);
        setImages(urls.length > 0 ? urls : []);
      })
      .catch(() => setImages([]));
  }, []);

  // Run timeline only once images are confirmed (not null)
  useEffect(() => {
    if (images === null || done) return;

    const displayItems = images.length > 0 ? images : FALLBACK_COLORS;
    const count = displayItems.length;
    const tl = gsap.timeline();

    // Hide everything before the timeline starts
    gsap.set(photoRefs.current.filter(Boolean), { autoAlpha: 0 });
    gsap.set(lettersRef.current.filter(Boolean), { autoAlpha: 0 });
    gsap.set(artRef.current, { autoAlpha: 0 });

    // Phase 1: photo flicker × 2 cycles

    for (let cycle = 0; cycle < 2; cycle++) {
      for (let i = 0; i < count; i++) {
        const el = photoRefs.current[i];
        if (!el) continue;
        const start = cycle * count * 0.48 + i * 0.48;
        tl.to(el, { autoAlpha: 1, duration: 0.12, ease: "power2.inOut" }, start);
        tl.to(el, { autoAlpha: 0, duration: 0.08, ease: "power2.inOut" }, start + 0.32);
      }
    }

    const afterFlicker = count * 0.48 * 2;

    // Phase 2: horizontal burst
    tl.fromTo(
      burstRef.current,
      { scaleX: 0, autoAlpha: 1 },
      { scaleX: 1, duration: 0.25, ease: "expo.out" },
      afterFlicker
    );
    tl.to(burstRef.current, { autoAlpha: 0, duration: 0.2, ease: "power1.in" }, afterFlicker + 0.22);

    // Phase 3: "Art" slides in
    tl.fromTo(
      artRef.current,
      { x: -20, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out" },
      afterFlicker + 0.15
    );

    // Phase 4: "Hussain." letters build in
    tl.fromTo(
      lettersRef.current.filter(Boolean),
      { y: 24, autoAlpha: 0, rotateX: -40 },
      { y: 0, autoAlpha: 1, rotateX: 0, duration: 0.5, ease: "back.out(1.4)", stagger: 0.06 },
      afterFlicker + 0.28
    );

    // Phase 5: hold → exit
    tl.to(containerRef.current, { autoAlpha: 0, duration: 0.35, ease: "power2.in" }, afterFlicker + 1.7);

    tl.eventCallback("onComplete", () => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setDone(true);
    });

    return () => { tl.kill(); };
  }, [images, done]);

  if (done) return null;
  // Still loading images — show blank overlay so there's no flash of site content
  if (images === null) {
    return <div className="preloader-root" aria-hidden="true" />;
  }

  const displayItems = images.length > 0 ? images : FALLBACK_COLORS;
  const HUSSAIN_LETTERS = "Hussain.".split("");

  return (
    <div ref={containerRef} className="preloader-root" aria-hidden="true">
      {/* Photo flicker layer */}
      <div className="preloader-photos">
        {displayItems.map((src, i) => (
          <div
            key={i}
            ref={(el) => { photoRefs.current[i] = el; }}
            className="preloader-photo"
            style={
              images.length > 0
                ? { backgroundImage: `url(${src})` }
                : { backgroundColor: src }
            }
          />
        ))}
      </div>

      {/* Burst flash */}
      <div ref={burstRef} className="preloader-burst" />

      {/* Name reveal */}
      <div className="preloader-name" style={{ perspective: "600px" }}>
        <div style={{ display: "inline-flex" }}>
          {HUSSAIN_LETTERS.map((char, i) => (
            <span
              key={i}
              ref={(el) => { lettersRef.current[i] = el; }}
              style={{ display: "inline-block" }}
            >
              {char}
            </span>
          ))}
        </div>
        <span ref={artRef} className="preloader-art">
          Art
        </span>
      </div>
    </div>
  );
}
