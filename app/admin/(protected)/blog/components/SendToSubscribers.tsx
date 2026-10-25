"use client";

import { useState } from "react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { ChoiceDialog } from "@/components/admin/choice-dialog/ChoiceDialog";
import { useChoice } from "@/components/admin/choice-dialog/useChoice";
import { useAdminSlice } from "@/hooks/useAdminData";
import { errorMessage, useAdminAction } from "@/hooks/useAdminAction";
import { sendToSubscribers } from "../lib/api";
import { withSavedPost } from "../lib/blog-store";
import type { BlogPostFormValues } from "../lib/types";

type Answer = "send" | "cancel";

const SEND_OPTIONS = [{ answer: "send" as const, label: "Send", variant: "solid" as const }];

function sentOn(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

/** Emails a saved, published post to the blog's subscribers — once per post. */
export function SendToSubscribers({ id, values }: { id: string; values: BlogPostFormValues }) {
  const [blog, setBlog] = useAdminSlice("blog");
  const { feedback, notify, setFeedback } = useAdminAction();
  const { pending, ask } = useChoice<void, Answer>(() => setFeedback(null));
  const [sending, setSending] = useState(false);

  const post = blog.posts.find((p) => p.id === id);
  if (!post?.isPublished) return null;

  if (post.notifiedAt) {
    return (
      <div className="rounded-xl border p-4">
        <div className="text-sm font-medium">Sent to subscribers</div>
        <div className="text-xs text-muted-foreground">{sentOn(post.notifiedAt)}</div>
      </div>
    );
  }

  const unsaved = JSON.stringify(values) !== JSON.stringify(blog.forms[id]);

  async function send() {
    if (sending || (await ask()) !== "send") return;
    setSending(true);
    setFeedback({ type: "info", text: "Sending…" });
    try {
      const saved = await sendToSubscribers(id);
      setBlog((current) => withSavedPost(current, saved));
      notify("ok", "Sent to subscribers.");
    } catch (e) {
      notify("err", errorMessage(e, "Not sent."));
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <AdminButton onClick={send} disabled={sending} className="w-full justify-center">
        Send to subscribers
      </AdminButton>
      <AdminActionFeedback feedback={feedback} className="" />
      {pending ? (
        <ChoiceDialog<Answer>
          heading={`Send “${post.title || "Untitled"}” to subscribers?`}
          options={SEND_OPTIONS}
          onAnswer={pending.answer}
          cancel="cancel"
        >
          {unsaved ? <p className="mt-2 text-sm text-muted-foreground">Unsaved changes are not in the email.</p> : null}
        </ChoiceDialog>
      ) : null}
    </>
  );
}
