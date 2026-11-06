import "server-only";
import { encodePacked, keccak256, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { privateKey } from "./keys";

/** Custodied HD: index 0 is the funded demo payer. Never log the key. */
export function custodyKeyForIndex(index: number): Hex {
  if (index === 0) return privateKey("PAYER_CUSTODY_KEY");
  const seed = privateKey("PAYER_CUSTODY_KEY");
  for (let n = 0; n < 8; n++) {
    const key = keccak256(
      encodePacked(["bytes32", "uint256", "uint8"], [seed, BigInt(index), n]),
    );
    try {
      privateKeyToAccount(key);
      return key;
    } catch {
      /* invalid curve point; try next salt */
    }
  }
  throw new Error("hd derive failed");
}

export function custodyAddressForIndex(index: number): Address {
  return privateKeyToAccount(custodyKeyForIndex(index)).address;
}
