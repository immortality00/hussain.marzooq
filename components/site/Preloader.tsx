"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMotionPreference } from "@/hooks/useMotionPreference";

const STALL_TICK_MS = 1000;
const STALL_LIMIT_MS = 4000;
const LIFETIME_MS = 13000;
const FADE_MS = 400;
const END_MARGIN_SECONDS = 0.02;
const PORTRAIT_QUERY = "(max-aspect-ratio: 1/1)";

const ANIMATION_MS = 5000;

const CUTS = {
  landscape: {
    webm: "/brand/preloader.webm",
    mp4: "/brand/preloader.mp4",
    poster: "/brand/preloader-poster.webp",
    animated: "/brand/preloader-anim.webp",
  },
  portrait: {
    webm: "/brand/preloader-mobile.webm",
    mp4: "/brand/preloader-mobile.mp4",
    poster: "/brand/preloader-mobile-poster.webp",
    animated: "/brand/preloader-mobile-anim.webp",
  },
};

type Phase = "loading" | "playing" | "leaving" | "done";

export function Preloader() {
  const motion = useMotionPreference();
  const portrait = useMediaQuery(PORTRAIT_QUERY);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [blocked, setBlocked] = useState(false);
  const [fallbackReady, setFallbackReady] = useState(false);

  useEffect(() => {
    if (!blocked) return;

    const warm = new Image();
    warm.onload = () => setFallbackReady(true);
    warm.onerror = () => setPhase("done");
    warm.src = portrait ? CUTS.portrait.animated : CUTS.landscape.animated;

    return () => {
      warm.onload = null;
      warm.onerror = null;
    };
  }, [blocked, portrait]);

  useEffect(() => {
    if (!blocked || !fallbackReady || phase === "leaving" || phase === "done") return;

    const id = window.setTimeout(() => setPhase("leaving"), ANIMATION_MS);

    return () => window.clearTimeout(id);
  }, [blocked, fallbackReady, phase]);

  useEffect(() => {
    if (phase === "leaving") {
      const id = window.setTimeout(() => setPhase("done"), FADE_MS);

      return () => window.clearTimeout(id);
    }

    if (phase !== "loading" || blocked) return;

    let seen = -1;
    let idle = 0;

    const id = window.setInterval(() => {
      const video = videoRef.current;
      if (!video) {
        idle += STALL_TICK_MS;
        if (idle >= STALL_LIMIT_MS) setPhase("done");
        return;
      }

      const buffered = video.buffered.length
        ? video.buffered.end(video.buffered.length - 1)
        : 0;
      const progress = Math.max(video.currentTime, buffered, video.readyState);

      if (progress > seen) {
        seen = progress;
        idle = 0;
        return;
      }

      idle += STALL_TICK_MS;
      if (idle >= STALL_LIMIT_MS) setPhase("done");
    }, STALL_TICK_MS);

    return () => window.clearInterval(id);
  }, [phase, blocked]);

  useEffect(() => {
    const id = window.setTimeout(() => setPhase("done"), LIFETIME_MS);

    return () => window.clearTimeout(id);
  }, []);

  const attachVideo = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (!node) return;

    node.defaultMuted = true;
    node.muted = true;
  }, []);

  useEffect(() => {
    if (motion !== "allow") return;

    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => setBlocked(true));
    });
  }, [motion, portrait]);

  if (phase === "done" || motion === "reduce") return null;

  const cut = portrait ? CUTS.portrait : CUTS.landscape;

  return (
    <div
      className={`preloader-root${phase === "leaving" ? " is-leaving" : ""}`}
      aria-hidden="true"
    >
      {motion === "allow" && blocked && fallbackReady && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cut.animated}
          alt=""
          className={`preloader-video${portrait ? " preloader-video-portrait" : ""}`}
        />
      )}

      {motion === "allow" && !blocked && (
        <video
          key={portrait ? "portrait" : "landscape"}
          ref={attachVideo}
          className={`preloader-video${portrait ? " preloader-video-portrait" : ""}`}
          poster={cut.poster}
          autoPlay
          muted
          playsInline
          preload="auto"
          onPlaying={() => setPhase((current) => (current === "loading" ? "playing" : current))}
          onTimeUpdate={(event) => {
            const video = event.currentTarget;
            const end = Number.isFinite(video.duration) ? video.duration : 0;
            if (end && video.currentTime >= end - END_MARGIN_SECONDS) setPhase("leaving");
          }}
          onEnded={() => setPhase("leaving")}
          onError={() => setBlocked(true)}
        >
          <source src={cut.mp4} type="video/mp4" />
          <source src={cut.webm} type='video/webm; codecs="vp9"' />
        </video>
      )}

      {phase === "loading" && (!blocked || !fallbackReady) && <div className="preloader-spinner" />}
    </div>
  );
}
