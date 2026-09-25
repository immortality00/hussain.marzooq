"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAdminAction } from "@/hooks/useAdminAction";
import { readPushSupport, urlBase64ToUint8Array, withTimeout } from "@/lib/client/push-support";
import {
  deletePushDevice,
  registerAdminWorker,
  savePushDevice,
  sendTestPush,
} from "@/lib/client/admin-push-api";

const noopSubscribe = () => () => {};

export function useAdminPush(publicKey: string | null) {
  const router = useRouter();
  const support = useSyncExternalStore(noopSubscribe, readPushSupport, () => "checking" as const);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const { feedback, notify, run } = useAdminAction({ autoDismiss: true });

  useEffect(() => {
    if (!publicKey || support !== "supported") return;
    let cancelled = false;

    registerAdminWorker()
      .then(async (registration) => {
        registrationRef.current = registration;
        const subscription = await registration.pushManager.getSubscription();
        if (cancelled) return;

        const granted = Notification.permission === "granted";
        setBlocked(Notification.permission === "denied");
        setSubscribed(Boolean(subscription) && granted);
        if (subscription && granted) await savePushDevice(subscription);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          notify("err", error instanceof Error ? error.message : "Couldn't start notifications.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [publicKey, support, notify]);

  async function act(fn: () => Promise<void>, successText?: string) {
    setBusy(true);
    await run(fn, { successText });
    setBusy(false);
  }

  async function subscribe(key: string) {
    try {
      const registration = registrationRef.current ?? (await registerAdminWorker());
      registrationRef.current = registration;
      const subscription = await withTimeout(
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key),
        }),
        "The browser's push service didn't respond."
      );
      await savePushDevice(subscription);
    } catch (error) {
      if (Notification.permission !== "denied") throw error;
      setBlocked(true);
      throw new Error("Notifications are blocked for this site.");
    }
  }

  const enable = () => {
    if (!publicKey) return;
    return act(async () => {
      await subscribe(publicKey);
      setSubscribed(true);
      setBlocked(false);
      router.refresh();
    }, "Notifications are on for this device.");
  };

  const disable = () =>
    act(async () => {
      const subscription = await registrationRef.current?.pushManager.getSubscription();
      if (subscription) {
        await deletePushDevice({ endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }
      setSubscribed(false);
      router.refresh();
    }, "Notifications are off for this device.");

  const sendTest = () =>
    act(async () => {
      const json = await sendTestPush();
      const sent = json?.sent ?? 0;
      const failed = json?.failed ?? 0;
      const devices = `${sent} device${sent === 1 ? "" : "s"}`;
      notify(failed ? "err" : "ok", `Sent to ${devices}${failed ? `, ${failed} failed` : ""}.`);
      router.refresh();
    });

  const removeDevice = (id: string) =>
    act(async () => {
      await deletePushDevice({ id });
      router.refresh();
    }, "Device removed.");

  return { support, subscribed, blocked, busy, feedback, enable, disable, sendTest, removeDevice };
}
