"use client";

import { useEffect, useState } from "react";

// True while any part of the site footer (`data-site-footer`) is on screen.
export function useSiteFooterInView() {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("[data-site-footer]");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return inView;
}
