"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMotionPreference } from "@/hooks/useMotionPreference";

const FAILSAFE_MS = 3000;
const LIFETIME_MS = 13000;
const FADE_MS = 400;
const END_MARGIN_SECONDS = 0.02;
const PORTRAIT_QUERY = "(max-aspect-ratio: 1/1)";

const CUTS = {
  landscape: { webm: "/brand/preloader.webm", mp4: "/brand/preloader.mp4", poster: "/brand/preloader-poster.webp" },
  portrait: {
    webm: "/brand/preloader-mobile.webm",
    mp4: "/brand/preloader-mobile.mp4",
    poster: "/brand/preloader-mobile-poster.webp",
  },
};

type Phase = "loading" | "playing" | "leaving" | "done";

export function Preloader() {
  const motion = useMotionPreference();
  const portrait = useMediaQuery(PORTRAIT_QUERY);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    if (phase !== "loading" && phase !== "leaving") return;

    const id = window.setTimeout(() => {
      if (phase === "loading") {
        const video = videoRef.current;
        const loading =
          video &&
          (video.networkState === video.NETWORK_LOADING ||
            video.readyState > 0 ||
            video.buffered.length > 0);

        if (loading) return;
      }

      setPhase("done");
    }, phase === "loading" ? FAILSAFE_MS : FADE_MS);

    return () => window.clearTimeout(id);
  }, [phase]);

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
      video.play().catch(() => setPhase("done"));
    });
  }, [motion, portrait]);

  if (phase === "done" || motion === "reduce") return null;

  const cut = portrait ? CUTS.portrait : CUTS.landscape;

  return (
    <div
      className={`preloader-root${phase === "leaving" ? " is-leaving" : ""}`}
      aria-hidden="true"
    >
      {motion === "allow" && (
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
          onError={() => setPhase("done")}
        >
          <source src={cut.mp4} type="video/mp4" />
          <source src={cut.webm} type='video/webm; codecs="vp9"' />
        </video>
      )}

      {phase === "loading" && <div className="preloader-spinner" />}
    </div>
  );
}
