/** "iPhone · Safari" from a user agent. Runtime-agnostic: the push card, passkeys and sign-in requests share it. */
function deviceOs(ua: string, touchPoints: number) {
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && touchPoints > 1)) return "iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Mac OS X/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows";
  if (/Linux|CrOS/.test(ua)) return /CrOS/.test(ua) ? "ChromeOS" : "Linux";
  return "Device";
}

function deviceBrowser(ua: string) {
  if (/Edg\//.test(ua)) return "Edge";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Browser";
}

export function deviceLabelOf(userAgent: string | null | undefined, touchPoints: number = 0) {
  const ua = (userAgent ?? "").slice(0, 512);
  return `${deviceOs(ua, touchPoints)} · ${deviceBrowser(ua)}`;
}
