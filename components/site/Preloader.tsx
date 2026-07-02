"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Cormorant_Garamond } from "next/font/google";
import { Camera, Video, Bitcoin, Code2 } from "lucide-react";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400"] });

type FlashItem = { icon: typeof Camera } | { emoji: string };

const ITEMS: FlashItem[] = [
  { icon: Camera },   // photography
  { icon: Video },    // videography
  { icon: Bitcoin },  // nft
  { emoji: "🕺💃" },  // dancing
  { icon: Code2 },    // web development
];
const ICON_BEAT = 0.22;
const CYCLES = 2;
const HUSSAIN_LETTERS = "Hussain.".split("");

export function Preloader() {
  const [done, setDone] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLSpanElement>(null);
  const hussainRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      // "Art" ends right of "Hussain."; offsetting it by half that width centers it on screen
      const hussainWidth = hussainRef.current?.offsetWidth ?? 0;
      gsap.set(artRef.current, { x: -hussainWidth / 2 });

      const tl = gsap.timeline();

      // Phase 1: discipline symbols flash, one per beat, repeated twice
      for (let cycle = 0; cycle < CYCLES; cycle++) {
        for (let i = 0; i < ITEMS.length; i++) {
          const el = itemRefs.current[i];
          if (!el) continue;
          const start = (cycle * ITEMS.length + i) * ICON_BEAT;
          tl.fromTo(
            el,
            { autoAlpha: 0, scale: 1.12 },
            { autoAlpha: 1, scale: 1, duration: 0.1, ease: "power2.out" },
            start
          );
          tl.to(el, { autoAlpha: 0, duration: 0.07, ease: "power1.in" }, start + 0.15);
        }
      }

      const afterFlash = ITEMS.length * CYCLES * ICON_BEAT;

      // Phase 2: horizontal light burst from center
      tl.fromTo(
        burstRef.current,
        { scaleX: 0, autoAlpha: 1 },
        { scaleX: 1, duration: 0.25, ease: "expo.out" },
        afterFlash
      );
      tl.to(burstRef.current, { autoAlpha: 0, duration: 0.2, ease: "power1.in" }, afterFlash + 0.22);

      // Phase 3: "Art" condenses out of the burst, centered on screen
      tl.fromTo(
        artRef.current,
        { autoAlpha: 0, letterSpacing: "0.4em", filter: "blur(8px)" },
        { autoAlpha: 1, letterSpacing: "0.02em", filter: "blur(0px)", duration: 0.5, ease: "power3.out" },
        afterFlash + 0.15
      );

      // Phase 4: "Art" glides right to its resting place...
      const build = afterFlash + 1.0;
      tl.to(artRef.current, { x: 0, duration: 0.8, ease: "power3.inOut" }, build);

      // ...while "Hussain." letters pull into focus from scatter, assembling outward from "Art"
      tl.fromTo(
        lettersRef.current.filter(Boolean),
        {
          x: () => gsap.utils.random(-90, 90),
          y: () => gsap.utils.random(-70, 70),
          rotation: () => gsap.utils.random(-35, 35),
          scale: 1.6,
          autoAlpha: 0,
          filter: "blur(14px)",
        },
        {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          autoAlpha: 1,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power4.out",
          stagger: { each: 0.06, from: "end" },
        },
        build + 0.1
      );

      // Phase 5: hold, then release the site
      tl.to(containerRef.current, { autoAlpha: 0, duration: 0.4, ease: "power2.in" }, build + 2.1);

      tl.eventCallback("onComplete", () => setDone(true));
    },
    { scope: containerRef }
  );

  if (done) return null;

  return (
    <div ref={containerRef} className="preloader-root" aria-hidden="true">
      <div className="preloader-icons">
        {ITEMS.map((item, i) => (
          <div
            key={i}
            ref={(el) => { itemRefs.current[i] = el; }}
            className="preloader-icon"
          >
            {"icon" in item ? (
              <item.icon strokeWidth={1.25} />
            ) : (
              <span className="preloader-emoji">{item.emoji}</span>
            )}
          </div>
        ))}
      </div>

      <div ref={burstRef} className="preloader-burst" />

      <div className={`preloader-name ${cormorant.className}`}>
        <div ref={hussainRef} className="preloader-hussain">
          {HUSSAIN_LETTERS.map((char, i) => (
            <span
              key={i}
              ref={(el) => { lettersRef.current[i] = el; }}
              className="preloader-letter"
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
