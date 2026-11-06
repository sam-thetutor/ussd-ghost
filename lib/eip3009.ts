import { type Address, type Hex, hexToNumber, slice, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { PRIZE_USDT } from "./addresses";
import { chain } from "./chain";

export const USDT_EIP712_NAME = "Tether USD";
export const USDT_EIP712_VERSION = "1";

export const transferWithAuthorizationTypes = {
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
} as const;

export type TransferAuth = {
  from: Address;
  to: Address;
  value: bigint;
  validAfter: bigint;
  validBefore: bigint;
  nonce: Hex;
};

export function usdtDomain() {
  return {
    name: USDT_EIP712_NAME,
    version: USDT_EIP712_VERSION,
    chainId: chain.id,
    verifyingContract: PRIZE_USDT,
  } as const;
}

export async function signTransferWithAuthorization(
  payerKey: Hex,
  message: TransferAuth,
): Promise<{ v: number; r: Hex; s: Hex; signature: Hex }> {
  const account = privateKeyToAccount(payerKey);
  const signature = await account.signTypedData({
    domain: usdtDomain(),
    types: transferWithAuthorizationTypes,
    primaryType: "TransferWithAuthorization",
    message,
  });
  return splitSig(signature);
}

export function splitSig(signature: Hex): {
  v: number;
  r: Hex;
  s: Hex;
  signature: Hex;
} {
  const r = slice(signature, 0, 32);
  const s = slice(signature, 32, 64);
  let v = hexToNumber(slice(signature, 64, 65));
  if (v < 27) v += 27;
  return { v, r, s, signature };
}

export function randomNonce(): Hex {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
}
