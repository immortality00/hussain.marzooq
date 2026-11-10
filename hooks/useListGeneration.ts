import { useState } from "react";
import { isExtension } from "@/lib/cylinder-slots";

/**
 * A number that changes only when a list is replaced (a new search, another tag),
 * not when more of it arrives at the end. Views that should keep their place
 * while photos keep loading use it as their reset key.
 */
export function useListGeneration(ids: readonly string[]): number {
  const signature = ids.join(",");
  const [seen, setSeen] = useState({ ids, signature, generation: 0 });
  if (seen.signature !== signature) {
    const generation = isExtension(seen.ids, ids) ? seen.generation : seen.generation + 1;
    setSeen({ ids, signature, generation });
    return generation;
  }
  return seen.generation;
}
