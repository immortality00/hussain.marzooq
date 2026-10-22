import { deviceLabelOf } from "@/lib/device-label";

export type PushSupport = "checking" | "supported" | "needs-install" | "unsupported";

const SUBSCRIBE_TIMEOUT_MS = 20_000;

function isIpad(ua: string) {
  return /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function readPushSupport(): PushSupport {
  if ("serviceWorker" in navigator && "PushManager" in window && "Notification" in window) {
    return "supported";
  }
  const ua = navigator.userAgent;
  const ios = /iPhone|iPod/.test(ua) || isIpad(ua);
  return ios && !isStandalone() ? "needs-install" : "unsupported";
}

export function thisDeviceLabel() {
  return deviceLabelOf(navigator.userAgent, navigator.maxTouchPoints);
}

export function pushDeviceLabel() {
  return `${thisDeviceLabel()}${isStandalone() ? " (Home Screen app)" : ""}`;
}

export function urlBase64ToUint8Array(value: string): Uint8Array<ArrayBuffer> {
  const padded = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`;
  const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

export function withTimeout<T>(
  promise: Promise<T>,
  message: string,
  ms: number = SUBSCRIBE_TIMEOUT_MS
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}
