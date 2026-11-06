const DEFAULT_BANNER = "USSD simulator — not a live MNO session.";

export function SimulatorBanner() {
  const text =
    process.env.NEXT_PUBLIC_SIMULATOR_BANNER?.trim() || DEFAULT_BANNER;

  return (
    <div
      role="status"
      className="sticky top-0 z-50 w-full border-b border-yellow-700/60 bg-[#111] px-4 py-2 text-center font-mono text-xs tracking-wide text-[#f5d76e] sm:text-sm"
    >
      {text}
    </div>
  );
}
