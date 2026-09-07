"use client";

import { useId } from "react";

export default function ContactMessageField({
  message,
  setMessage,
  contextMessage,
}: {
  message: string;
  setMessage: (value: string) => void;
  contextMessage?: string;
}) {
  const messageId = useId();

  return (
    <div className="space-y-3 sm:col-span-2">
      {contextMessage ? (
        <div className="rounded-2xl border bg-muted/50 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Inquiry context
          </div>
          <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {contextMessage}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor={messageId} className="text-sm font-medium">
          Message *
        </label>
        <textarea
          id={messageId}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="h-32 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder={contextMessage ? "Add your message here" : "Tell me about your project"}
        />
      </div>
    </div>
  );
}
