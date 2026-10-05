export function requestHost(req: Request) {
  const forwarded = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("host");
}

export function fromAnotherSite(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return origin === "null" || new URL(origin).host !== requestHost(req);
  } catch {
    return true;
  }
}
