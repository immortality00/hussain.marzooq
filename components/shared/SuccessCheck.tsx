/**
 * The drawn success mark (MO2): the ring draws, then the tick, 470 ms in all (`app/styles/motion.css`).
 * Uses the text colour around it; decorative only — the success message beside it is what is announced.
 */
export function SuccessCheck({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
    >
      <path className="hm-success-ring" pathLength={1} d="M12 1.5a10.5 10.5 0 1 1 0 21a10.5 10.5 0 1 1 0-21" />
      <path className="hm-success-tick" pathLength={1} d="M7.5 12.3l3 3 6-6.5" />
    </svg>
  );
}
