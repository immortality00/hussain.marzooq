"use client";

import { useEffect } from "react";
import { useConfirmDiscard } from "@/components/admin/choice-dialog/useDiscardChanges";

// While there are unsaved changes: a tap on a link to another page of the site asks "Discard your changes?"
// first, and Discard follows that same link — its own click handler included. A reload or a closed tab gets the
// browser's own prompt, the only one browsers allow there. Render the returned dialog with ConfirmDialog.
export function useUnsavedChangesGuard(hasUnsavedChanges: boolean) {
  const { confirm: confirmLeave, dialog } = useConfirmDiscard(hasUnsavedChanges);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    // The link being followed after Discard: its click is let through.
    let following: HTMLAnchorElement | null = null;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const onClickCapture = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as Element | null)?.closest("a");
      if (!anchor || anchor === following) return;
      if (anchor.target && anchor.target !== "_self") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      e.preventDefault();
      e.stopPropagation();
      void confirmLeave().then((leave) => {
        if (!leave || !anchor.isConnected) return;
        following = anchor;
        anchor.click();
        following = null;
      });
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClickCapture, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClickCapture, true);
    };
  }, [hasUnsavedChanges, confirmLeave]);

  return dialog;
}
