"use client";

import { useId } from "react";
import { Button } from "@/components/shared/Button";
import { FormStatus } from "@/components/shared/FormStatus";
import { cn } from "@/lib/utils";
import type { SubscribeCopy } from "@/lib/blog-subscribe-copy";
import { useBlogSubscribe } from "./useBlogSubscribe";

/** Email sign-up for new posts. The address is added only after it is confirmed from the email that arrives.
 *  A container query lays it out: side by side on the wide blog listing, stacked inside a post's column. */
export function BlogSubscribeForm({ copy, className }: { copy: SubscribeCopy; className?: string }) {
  const id = useId();
  const form = useBlogSubscribe(copy.confirmation);
  const hasWords = Boolean(copy.heading || copy.text);

  return (
    <section
      aria-labelledby={copy.heading ? `${id}-heading` : undefined}
      aria-label={copy.heading ? undefined : "Subscribe to the blog"}
      className={cn("premium-panel @container p-6 sm:p-10", className)}
    >
      <div
        className={cn(
          "grid gap-8",
          hasWords && "@3xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] @3xl:items-end"
        )}
      >
        {hasWords && (
          <div>
            {copy.heading && (
              <h2 id={`${id}-heading`} className="text-3xl font-semibold tracking-tight wrap-anywhere sm:text-4xl">
                {copy.heading}
              </h2>
            )}
            {copy.text && (
              <p
                className={cn(
                  "max-w-md text-sm leading-6 text-muted-foreground wrap-anywhere sm:text-base sm:leading-7",
                  copy.heading && "mt-4"
                )}
              >
                {copy.text}
              </p>
            )}
          </div>
        )}

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
              {form.sending ? "Sending…" : copy.buttonLabel}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
