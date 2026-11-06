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

const DEPLOYED_REGISTRY =
  "0x7a11BF706e315F5f677Cd5c988b721e578494Cca" as Address;
const DEPLOYED_GATEWAY =
  "0xf7Abc80Ff95113CE6386554bB1287D11b05A4052" as Address;
const DEPLOYED_MERCHANT =
  "0xBF3578826CB053c29fd68BD2AD599401BCc14741" as Address;

export function registryAddress(): Address {
  const value =
    process.env.REGISTRY_ADDRESS || process.env.NEXT_PUBLIC_REGISTRY_ADDRESS;
  return (value || DEPLOYED_REGISTRY) as Address;
}

export function gatewayAddress(): Address {
  const value =
    process.env.GATEWAY_ADDRESS || process.env.NEXT_PUBLIC_GATEWAY_ADDRESS;
  return (value || DEPLOYED_GATEWAY) as Address;
}

export function merchantPayee(): Address {
  const value = process.env.MERCHANT_PAYEE || process.env.NEXT_PUBLIC_MERCHANT_PAYEE;
  return (value || DEPLOYED_MERCHANT) as Address;
}

export function explorerAddress(addr: string): string {
  return `${EXPLORER}/address/${addr}`;
}

export function explorerTx(hash: string): string {
  return `${EXPLORER}/tx/${hash}`;
}
