"use client";

import { useEffect } from "react";

export function useModalNavbarLock(isOpen: boolean) {
  useEffect(() => {
    window.dispatchEvent(new Event(isOpen ? "hm_modal_open" : "hm_modal_close"));

    return () => {
      if (isOpen) window.dispatchEvent(new Event("hm_modal_close"));
    };
  }, [isOpen]);
}