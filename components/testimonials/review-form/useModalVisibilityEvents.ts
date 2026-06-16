"use client";

import { useEffect } from "react";

export function useModalVisibilityEvents(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    window.dispatchEvent(new Event("hm_modal_open"));

    return () => {
      window.dispatchEvent(new Event("hm_modal_close"));
    };
  }, [isOpen]);
}