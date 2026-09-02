"use client";

import "./globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Something went wrong
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            The site hit an unexpected error. Reloading usually fixes it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="hm-btn border border-white/30 text-white hover:border-white hover:bg-white hover:text-black"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              className="hm-btn bg-white text-black hover:bg-neutral-200"
            >
              Back home
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
