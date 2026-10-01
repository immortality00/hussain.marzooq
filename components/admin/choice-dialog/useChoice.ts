"use client";

import { useCallback, useState } from "react";

export type PendingChoice<Q, A> = { question: Q; answer: (answer: A) => void };

export function useChoice<Q, A>(onAsk?: () => void) {
  const [pending, setPending] = useState<PendingChoice<Q, A> | null>(null);

  const ask = useCallback(
    (question: Q) =>
      new Promise<A>((resolve) => {
        onAsk?.();
        setPending({
          question,
          answer: (answer) => {
            setPending(null);
            resolve(answer);
          },
        });
      }),
    [onAsk]
  );

  return { pending, ask };
}
