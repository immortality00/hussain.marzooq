"use client";

import { createContext, use, useMemo, type ReactNode } from "react";
import { useAdminSlice } from "@/hooks/useAdminData";
import type { PersonProfileOption } from "../lib/types";

export type MediaTagOption = { slug: string; label: string };
export type MediaOptions = { people: PersonProfileOption[]; tags: MediaTagOption[] };

const MediaOptionsContext = createContext<MediaOptions>({ people: [], tags: [] });

export function MediaOptionsProvider({ children }: { children: ReactNode }) {
  const [people] = useAdminSlice("people");
  const [tags] = useAdminSlice("mediaTags");
  const value = useMemo<MediaOptions>(
    () => ({
      people: people.map(({ id, name, slug, avatarUrl, isPublic, isPrivate }) => ({
        id,
        name,
        slug,
        avatarUrl,
        isPublic,
        isPrivate,
      })),
      tags: tags.filter((tag) => tag.isActive).map(({ slug, label }) => ({ slug, label })),
    }),
    [people, tags]
  );
  return <MediaOptionsContext value={value}>{children}</MediaOptionsContext>;
}

export function useMediaOptions() {
  return use(MediaOptionsContext);
}
