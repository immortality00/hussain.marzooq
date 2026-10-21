"use client";

import { useSyncExternalStore } from "react";

// The homepage preloader (components/site/Preloader.tsx) plays its own video, or
// its animated fallback, over the hero. The hero's extra photos wait until that
// file has downloaded, or the preloader has gone, so they never slow it down:
// photos and preloader come from different servers, so download priority cannot
// order them. This only reads the preloader's markup; with no preloader on the
// page — reduced motion, or it already finished — the answer is yes at once.
const PRELOADER = ".preloader-root";
const MEDIA_EVENTS = ["progress", "suspend", "canplaythrough", "load", "ended"] as const;

function fullyBuffered(video: HTMLVideoElement) {
  const { buffered, duration } = video;
  return buffered.length > 0 && duration > 0 && buffered.end(buffered.length - 1) >= duration - 0.25;
}

function getSnapshot() {
  const root = document.querySelector(PRELOADER);
  if (!root) return true;
  const video = root.querySelector("video");
  if (video) return fullyBuffered(video);
  const image = root.querySelector("img");
  return Boolean(image?.complete && image.naturalWidth > 0);
}

function subscribe(onChange: () => void) {
  const root = document.querySelector(PRELOADER);
  if (!root) return () => {};
  const watched = new Set<Element>();
  const watch = () => {
    for (const media of root.querySelectorAll("video, img")) {
      if (watched.has(media)) continue;
      watched.add(media);
      for (const type of MEDIA_EVENTS) media.addEventListener(type, onChange);
    }
    onChange();
  };
  const observer = new MutationObserver(watch);
  observer.observe(root, { childList: true, subtree: true });
  if (root.parentNode) observer.observe(root.parentNode, { childList: true });
  watch();
  return () => {
    observer.disconnect();
    for (const media of watched) for (const type of MEDIA_EVENTS) media.removeEventListener(type, onChange);
  };
}

export function usePreloaderMediaLoaded(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
