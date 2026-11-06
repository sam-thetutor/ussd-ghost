import type { Address } from "viem";
import { PRIZE_USDT, USDT_E_DO_NOT_USE, gatewayAddress, registryAddress } from "./addresses";
import { AMOUNT_CAP, RELAYER_MIN_WBT, tillLookup } from "./demo-state";
import { InvoiceStatus } from "./abi";
import type { RejectReason } from "./reject-log";

export const ALLOWLIST = [
  { label: "Prize USDT", address: PRIZE_USDT, note: "transferWithAuthorization only" },
  { label: "GhostGateway", addressEnv: "GATEWAY_ADDRESS", note: "settle only" },
  { label: "GhostInvoiceRegistry", addressEnv: "REGISTRY_ADDRESS", note: "open / markPaid" },
] as const;

export type InvoiceView = {
  invoiceId: `0x${string}`;
  payee: Address;
  amount: bigint;
  validAfter: bigint;
  validBefore: bigint;
  status: number;
};

export type PolicyInput = {
  invoice: InvoiceView | null;
  from: Address;
  to: Address;
  value: bigint;
  nowSec: number;
  relayerWbt: bigint;
  nonceUsed: boolean;
  paused: boolean;
  payerAllowed: boolean;
  drain?: boolean;
};

export function evaluatePolicy(input: PolicyInput): RejectReason | null {
  if (input.drain) return "drain_drill";
  if (input.to.toLowerCase() === USDT_E_DO_NOT_USE.toLowerCase()) return "wrong_token";
  if (!input.invoice) return "unknown_invoice";
  if (input.invoice.status !== InvoiceStatus.Open) return "unknown_invoice";
  if (input.paused) return "paused";
  if (!input.payerAllowed) return "payer_not_allowed";
  if (input.relayerWbt < RELAYER_MIN_WBT) return "relayer_wbt_low";
  if (input.value > AMOUNT_CAP) return "over_cap";
  if (input.to.toLowerCase() !== input.invoice.payee.toLowerCase()) {
    return "target_not_registered";
  }
  if (input.value !== input.invoice.amount) return "amount_mismatch";
  const now = BigInt(input.nowSec);
  if (now < input.invoice.validAfter || now >= input.invoice.validBefore) return "expired";
  if (input.nonceUsed) return "replayed_nonce";
  return null;
}

export function allowlistAddresses(): { label: string; address: string; note: string }[] {
  let gateway = "";
  let registry = "";
  try {
    gateway = gatewayAddress();
  } catch {
    gateway = "(not deployed)";
  }
  try {
    registry = registryAddress();
  } catch {
    registry = "(not deployed)";
  }
  return [
    { label: "Prize USDT", address: PRIZE_USDT, note: "transferWithAuthorization only" },
    { label: "GhostGateway", address: gateway, note: "settle only" },
    { label: "GhostInvoiceRegistry", address: registry, note: "open / markPaid" },
  ];
}

export function knownTill(till: string) {
  return tillLookup(till);
}
