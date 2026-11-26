import { displayStatus, statusLabel } from "./lib";

/**
 * The status on the artwork itself, in dark glass, with a pulse while it is available — the
 * card's badge, used by the popup too. The card shows a sold piece with its stamp instead.
 */
export function NftStatusBadge({
  status,
  withSold = false,
}: {
  status: ReturnType<typeof displayStatus>;
  withSold?: boolean;
}) {
  if (status === "sold" && !withSold) return null;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-white backdrop-blur-[6px]">
      {status === "available" ? (
        <span className="hm-nft-pulse relative inline-block h-1.5 w-1.5 rounded-full bg-white text-white" />
      ) : null}
      {statusLabel(status)}
    </span>
  );
}
