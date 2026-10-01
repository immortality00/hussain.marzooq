"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { errorMessage, useAdminAction } from "@/hooks/useAdminAction";
import { readPushSupport, urlBase64ToUint8Array, withTimeout } from "@/lib/client/push-support";
import {
  deletePushDevice,
  forgetSavedPushDevice,
  registerAdminWorker,
  savedPushEndpoint,
  savePushDevice,
  sendTestPush,
} from "@/lib/client/admin-push-api";
import { runAfterAdminData } from "@/lib/client/admin-store";
import { endpointHash, pushDeviceState, type PushDevice } from "@/lib/push-subscription";

const noopSubscribe = () => () => {};

type Local = { subscription: PushSubscription; hash: string } | null;

async function localOf(subscription: PushSubscription | null): Promise<Local> {
  if (!subscription || Notification.permission !== "granted") return null;
  return { subscription, hash: await endpointHash(subscription.endpoint) };
}

export function useAdminPush(publicKey: string | null, devices: PushDevice[]) {
  const support = useSyncExternalStore(noopSubscribe, readPushSupport, () => "checking" as const);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const resavingRef = useRef(false);
  const [local, setLocal] = useState<Local>(null);
  const [blocked, setBlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const { feedback, notify, run } = useAdminAction({ autoDismiss: true });

  const state = pushDeviceState({
    endpoint: local?.subscription.endpoint ?? null,
    hash: local?.hash ?? null,
    savedEndpoint: savedPushEndpoint(),
    devices,
  });

  useEffect(() => {
    if (!publicKey || support !== "supported") return;
    let cancelled = false;
    registerAdminWorker()
      .then(async (registration) => {
        registrationRef.current = registration;
        const next = await localOf(await registration.pushManager.getSubscription());
        if (cancelled) return;
        setBlocked(Notification.permission === "denied");
        setLocal(next);
      })
      .catch((error: unknown) => {
        if (!cancelled) notify("err", errorMessage(error, "Couldn't start notifications."));
      });
    return () => {
      cancelled = true;
    };
  }, [publicKey, support, notify]);

  useEffect(() => {
    if (state !== "resave" || !local || resavingRef.current) return;
    resavingRef.current = true;
    void runAfterAdminData(() =>
      savePushDevice(local.subscription)
        .catch((error: unknown) => notify("err", errorMessage(error, "Couldn't start notifications.")))
        .finally(() => {
          resavingRef.current = false;
        })
    );
  }, [state, local, notify]);

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
      setLocal(await localOf(subscription));
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
      setBlocked(false);
    }, "Notifications are on for this device.");
  };

  const disable = () =>
    act(async () => {
      const subscription = await registrationRef.current?.pushManager.getSubscription();
      if (subscription) {
        await deletePushDevice({ endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }
      forgetSavedPushDevice();
      setLocal(null);
    }, "Notifications are off for this device.");

  const sendTest = () =>
    act(async () => {
      const json = await sendTestPush();
      const sent = json?.sent ?? 0;
      const failed = json?.failed ?? 0;
      const count = `${sent} device${sent === 1 ? "" : "s"}`;
      notify(failed ? "err" : "ok", `Sent to ${count}${failed ? `, ${failed} failed` : ""}.`);
    });

  const removeDevice = (id: string) =>
    act(async () => {
      await deletePushDevice({ id });
    }, "Device removed.");

  return { support, subscribed: state !== "off", blocked, busy, feedback, enable, disable, sendTest, removeDevice };
}
