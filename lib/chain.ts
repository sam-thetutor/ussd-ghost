import { createPublicClient, createWalletClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { whitechainSepolia } from "viem/chains";

export const chain = whitechainSepolia;

export function getRpcUrl(): string {
  return (
    process.env.WHITECHAIN_RPC_URL ||
    process.env.WHITECHAIN_SEPOLIA_RPC_URL ||
    "https://rpc.testnet.whitechain.io"
  );
}

export function getPublicClient() {
  return createPublicClient({
    chain: whitechainSepolia,
    transport: http(getRpcUrl()),
  });
}

export function getWalletClient(privateKey: Hex) {
  const account = privateKeyToAccount(privateKey);
  return createWalletClient({
    account,
    chain: whitechainSepolia,
    transport: http(getRpcUrl()),
  });
}
