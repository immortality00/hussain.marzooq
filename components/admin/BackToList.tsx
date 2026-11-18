"use client";

import type { MouseEvent } from "react";
import { AdminLink } from "@/components/admin/AdminLink";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { useBackToList } from "@/hooks/useBackToList";

const LABEL = "Back to list";
const CLASSES = adminButtonClasses("default", "md");

type Props =
  | { href: string; beforeLeave?: () => Promise<boolean>; disabled?: boolean; onClick?: undefined }
  | { onClick: () => void; disabled?: boolean; href?: undefined; beforeLeave?: undefined };

// The one way back from an admin editor to its list, first in the editor's header. Given `href` it is a real
// link to the list; when the page before this one was that list it goes back in history instead, so the list
// comes back as it was left — its search, its rows and its place. Given `onClick` it is a button, for a form
// shown on the list's own screen (People, Galleries).
export function BackToList(props: Props) {
  const { goBack, navigationCover } = useBackToList(props.href ?? "");

  if (props.href === undefined) {
    return (
      <button type="button" onClick={props.onClick} disabled={props.disabled} className={CLASSES}>
        {LABEL}
      </button>
    );
  }

  const { href, beforeLeave, disabled } = props;

  async function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (beforeLeave && !(await beforeLeave())) return;
    goBack();
  }

  return (
    <>
      <AdminLink
        href={href}
        onClick={(event) => void onClick(event)}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        className={disabled ? `${CLASSES} pointer-events-none opacity-60` : CLASSES}
      >
        {LABEL}
      </AdminLink>
      {navigationCover}
    </>
  );
}
