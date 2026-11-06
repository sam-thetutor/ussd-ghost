import { keccak256, stringToBytes, type Address } from "viem";
import { merchantPayee } from "./addresses";
import { requiredEnv } from "./keys";

export const DEMO_TILL = process.env.DEMO_TILL || "123456";
export const DEMO_PHONE = process.env.DEMO_PHONE || "+254700000001";
export const TILL_NAME = "Mama Amina Kiosk";
export const SERVICE_CODE = "*384*71#";
export const AMOUNT_CAP = BigInt(100) * BigInt(1_000_000);
export const RELAYER_MIN_WBT = BigInt(10) ** BigInt(16); // 0.01 WBT
export const INVOICE_TTL_SEC = 15 * 60;

export function demoPayerAddress(): Address {
  const value = process.env.PAYER_ADDRESS;
  if (!value) throw new Error("PAYER_ADDRESS is not set");
  return value as Address;
}

export function tillLookup(till: string): { name: string; payee: Address } | null {
  if (till !== DEMO_TILL) return null;
  return { name: TILL_NAME, payee: merchantPayee() };
}

export function payerHint(phone: string): `0x${string}` {
  return keccak256(stringToBytes(phone));
}

export function demoPinHash(): string {
  return requiredEnv("DEMO_PIN_HASH");
}

export function isDemoPhone(phone: string): boolean {
  const normalized = phone.replace(/\s+/g, "");
  return normalized === DEMO_PHONE || normalized === DEMO_PHONE.replace("+", "");
}
