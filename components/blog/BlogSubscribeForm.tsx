"use client";

import { useId } from "react";
import { Button } from "@/components/shared/Button";
import { FormStatus } from "@/components/shared/FormStatus";
import { cn } from "@/lib/utils";
import { useBlogSubscribe } from "./useBlogSubscribe";

/** Email sign-up for new posts. The address is added only after it is confirmed from the email that arrives.
 *  A container query lays it out: side by side on the wide blog listing, stacked inside a post's column. */
export function BlogSubscribeForm({ className }: { className?: string }) {
  const id = useId();
  const form = useBlogSubscribe();

  return (
    <section aria-labelledby={`${id}-heading`} className={cn("premium-panel @container p-6 sm:p-10", className)}>
      <div className="grid gap-8 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] @3xl:items-end">
        <div>
          <h2 id={`${id}-heading`} className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Notes from the darkroom.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            New stories from behind the lens, sent the moment they’re published — nothing else.
          </p>
        </div>

        <form
          className="space-y-3"
          noValidate
          onFocusCapture={() => void form.prime().catch(() => undefined)}
          onSubmit={(event) => {
            event.preventDefault();
            void form.submit();
          }}
        >
          <div className="sr-only" aria-hidden="true">
            <label htmlFor={`${id}-website`}>Website</label>
            <input
              id={`${id}-website`}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => form.setWebsite(e.target.value)}
            />
          </div>

          <FormStatus status={form.status} />

          <div className="flex flex-col gap-3 @sm:flex-row">
            <label htmlFor={`${id}-email`} className="sr-only">
              Email
            </label>
            <input
              id={`${id}-email`}
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={254}
              value={form.email}
              onChange={(e) => form.setEmail(e.target.value)}
              placeholder="you@email.com"
              className="min-w-0 flex-1 rounded-xl border bg-background px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-ring md:text-sm"
            />
            <Button type="submit" variant="solid" disabled={form.sending} className="justify-center">
              {form.sending ? "Sending…" : "Keep me posted"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
