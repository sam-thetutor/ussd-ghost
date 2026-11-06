import type { Address } from "viem";

/** Prize USDT on Whitechain Sepolia 1874. Not USDT.e. */
export const PRIZE_USDT = (process.env.PRIZE_USDT ||
  process.env.NEXT_PUBLIC_PRIZE_USDT ||
  "0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7") as Address;

/** Docs/Portal bridged token. Paying this does not qualify. */
export const USDT_E_DO_NOT_USE =
  "0xaa7962d073935D387e8d442DA1D7149C81388f46" as Address;

export const EXPLORER =
  process.env.NEXT_PUBLIC_EXPLORER || "https://explorer.testnet.whitechain.io";

export function registryAddress(): Address {
  const value =
    process.env.REGISTRY_ADDRESS || process.env.NEXT_PUBLIC_REGISTRY_ADDRESS;
  if (!value) throw new Error("REGISTRY_ADDRESS is not set");
  return value as Address;
}

export function gatewayAddress(): Address {
  const value =
    process.env.GATEWAY_ADDRESS || process.env.NEXT_PUBLIC_GATEWAY_ADDRESS;
  if (!value) throw new Error("GATEWAY_ADDRESS is not set");
  return value as Address;
}

export function merchantPayee(): Address {
  const value = process.env.MERCHANT_PAYEE;
  if (!value) throw new Error("MERCHANT_PAYEE is not set");
  return value as Address;
}

export function explorerAddress(addr: string): string {
  return `${EXPLORER}/address/${addr}`;
}

export function explorerTx(hash: string): string {
  return `${EXPLORER}/tx/${hash}`;
}
