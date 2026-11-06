export type RejectReason =
  | "unknown_invoice"
  | "expired"
  | "amount_mismatch"
  | "replayed_nonce"
  | "target_not_registered"
  | "relayer_wbt_low"
  | "drain_drill"
  | "paused"
  | "payer_not_allowed"
  | "over_cap"
  | "wrong_token"
  | "insufficient_usdt"
  | "contracts_unconfigured";

export type RejectEntry = {
  at: string;
  reason: RejectReason;
  detail: string;
  invoiceId?: string;
};

const MAX = 40;
const log: RejectEntry[] = [];

export function pushReject(entry: Omit<RejectEntry, "at">): RejectEntry {
  const full: RejectEntry = { at: new Date().toISOString(), ...entry };
  log.unshift(full);
  if (log.length > MAX) log.pop();
  return full;
}

export function listRejects(): RejectEntry[] {
  return [...log];
}
