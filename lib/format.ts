import { formatUnits } from "viem";

export function formatUsdt(amount: bigint): string {
  const raw = formatUnits(amount, 6);
  const [whole, frac = ""] = raw.split(".");
  const padded = frac.padEnd(2, "0");
  const trimmed = padded.replace(/0+$/, "");
  return trimmed.length === 0 ? `${whole}.00` : `${whole}.${trimmed.padEnd(2, "0")}`;
}
