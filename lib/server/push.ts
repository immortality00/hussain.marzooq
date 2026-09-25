import webpush, { WebPushError } from "web-push";
import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/server/db";
import { SITE_URL } from "@/lib/seo/site-url";
import {
  cleanDeviceLabel,
  type PushDevice,
  type PushPayload,
  type PushSubscriptionInput,
} from "@/lib/push-subscription";

type PushSubscriptionDoc = PushSubscriptionInput & {
  label: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PushSendResult = { sent: number; removed: number; failed: number };

const TTL_SECONDS = 24 * 60 * 60;
const SEND_TIMEOUT_MS = 10_000;

function vapidDetails() {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim() ?? "";
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim() ?? "";
  if (!publicKey || !privateKey) return null;

  const subject = process.env.VAPID_SUBJECT?.trim() || SITE_URL;
  return { subject, publicKey, privateKey };
}

export function getVapidPublicKey(): string | null {
  return vapidDetails()?.publicKey ?? null;
}

export function isPushConfigured(): boolean {
  return vapidDetails() !== null;
}

async function subscriptions() {
  const db = await getDb();
  return db.collection<PushSubscriptionDoc>("push_subscriptions");
}

export async function savePushSubscription(subscription: PushSubscriptionInput, label: string) {
  const now = new Date();
  const col = await subscriptions();
  await col.updateOne(
    { endpoint: subscription.endpoint },
    {
      $set: { keys: subscription.keys, label: cleanDeviceLabel(label), updatedAt: now },
      $setOnInsert: { endpoint: subscription.endpoint, createdAt: now },
    },
    { upsert: true }
  );
}

export async function removePushSubscription(endpoint: string) {
  const col = await subscriptions();
  await col.deleteOne({ endpoint });
}

export async function removePushDevice(id: ObjectId) {
  const col = await subscriptions();
  await col.deleteOne({ _id: id });
}

export async function listPushDevices(): Promise<PushDevice[]> {
  const col = await subscriptions();
  const docs = await col
    .find({}, { projection: { label: 1, createdAt: 1 } })
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map((doc) => ({
    id: String(doc._id),
    label: cleanDeviceLabel(doc.label),
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : null,
  }));
}

function isGone(error: unknown): boolean {
  return error instanceof WebPushError && (error.statusCode === 404 || error.statusCode === 410);
}

export async function sendAdminPush(payload: PushPayload): Promise<PushSendResult> {
  const details = vapidDetails();
  const result: PushSendResult = { sent: 0, removed: 0, failed: 0 };
  if (!details) return result;

  const col = await subscriptions();
  const targets = await col.find({}, { projection: { endpoint: 1, keys: 1 } }).toArray();
  if (targets.length === 0) return result;

  const body = JSON.stringify(payload);
  const outcomes = await Promise.allSettled(
    targets.map((sub) =>
      webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, body, {
        vapidDetails: details,
        TTL: TTL_SECONDS,
        urgency: "high",
        timeout: SEND_TIMEOUT_MS,
      })
    )
  );

  const gone: string[] = [];
  outcomes.forEach((outcome, index) => {
    if (outcome.status === "fulfilled") {
      result.sent += 1;
    } else if (isGone(outcome.reason)) {
      gone.push(targets[index].endpoint);
    } else {
      result.failed += 1;
      const error = outcome.reason;
      const status = error instanceof WebPushError ? error.statusCode : "network";
      console.error(`[push] delivery failed (${status})`, error instanceof Error ? error.message : error);
    }
  });

  if (gone.length > 0) {
    await col.deleteMany({ endpoint: { $in: gone } });
    result.removed = gone.length;
  }

  return result;
}
