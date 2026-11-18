"use client";

import { useEffect, useRef } from "react";
import { showListReturn, takeListReturn } from "@/lib/client/list-return";

// Once a list has drawn its rows: when it is being come back to (lib/client/list-return.ts), put the row back
// where it was and mark it. Runs after Next.js has finished its own scrolling for the navigation, and only once
// per showing of the list.
export function useListReturn(list: string, view: string, ready: boolean) {
  const done = useRef(false);

  useEffect(() => {
    if (!ready || done.current) return;
    done.current = true;
    const record = takeListReturn(list, view);
    if (record) showListReturn(record);
  }, [list, view, ready]);
}
