import "server-only";
import { encodePacked, keccak256, type Address, type Hex } from "viem";
import { gatewayAbi, registryAbi, usdtAbi } from "./abi";
import {
  PRIZE_USDT,
  USDT_E_DO_NOT_USE,
  gatewayAddress,
  registryAddress,
} from "./addresses";
import { getPublicClient, getWalletClient } from "./chain";
import { INVOICE_TTL_SEC, payerHint } from "./demo-state";
import { randomNonce } from "./eip3009";
import { formatUsdt } from "./format";
import { rememberInvoice } from "./invoices";
import { privateKey } from "./keys";
import {
  allocateUser,
  findByPhone,
  markAllowlisted,
  nextWalletIndex,
  type P2pUser,
} from "./p2p-directory";
import { custodyAddressForIndex, custodyKeyForIndex } from "./p2p-wallets";
import { settleInvoice, type SettleResult } from "./relayer";

export async function prizeBalance(address: Address): Promise<bigint> {
  return getPublicClient().readContract({
    address: PRIZE_USDT,
    abi: usdtAbi,
    functionName: "balanceOf",
    args: [address],
  });
}

export async function formatPrizeBalance(address: Address): Promise<string> {
  return formatUsdt(await prizeBalance(address));
}

async function isPayerAllowed(address: Address): Promise<boolean> {
  return getPublicClient().readContract({
    address: gatewayAddress(),
    abi: gatewayAbi,
    functionName: "payerAllowed",
    args: [address],
  });
}

export async function ensureAllowlisted(user: P2pUser): Promise<boolean> {
  if (user.allowlisted) return true;
  try {
    if (await isPayerAllowed(user.address)) {
      markAllowlisted(user.address);
      return true;
    }
  } catch {
    /* fall through to setPayer */
  }
  try {
    const owner = getWalletClient(privateKey("DEPLOYER_PRIVATE_KEY"));
    const hash = await owner.writeContract({
      address: gatewayAddress(),
      abi: gatewayAbi,
      functionName: "setPayer",
      args: [user.address, true],
    });
    await getPublicClient().waitForTransactionReceipt({ hash });
    markAllowlisted(user.address);
    return true;
  } catch (error) {
    console.error(
      "setPayer failed",
      error instanceof Error ? error.message : "error",
    );
    return false;
  }
}

export async function activatePhone(
  phone: string,
  pinHash?: string,
): Promise<{
  user: P2pUser;
  balance: string;
  created: boolean;
}> {
  const existing = findByPhone(phone);
  if (existing) {
    await ensureAllowlisted(existing);
    return {
      user: existing,
      balance: await formatPrizeBalance(existing.address),
      created: false,
    };
  }
  const index = nextWalletIndex();
  const address = custodyAddressForIndex(index);
  const user = allocateUser(phone, address, index, pinHash);
  await ensureAllowlisted(user);
  return {
    user,
    balance: await formatPrizeBalance(user.address),
    created: true,
  };
}

async function openEnvelope(payee: Address, amount: bigint, hintPhone: string): Promise<Hex> {
  if (payee.toLowerCase() === USDT_E_DO_NOT_USE.toLowerCase()) {
    throw new Error("USDT.e is not allowed");
  }
  const now = Math.floor(Date.now() / 1000);
  const validAfter = BigInt(0);
  const validBefore = BigInt(now + INVOICE_TTL_SEC);
  const invoiceId = keccak256(
    encodePacked(
      ["address", "uint256", "uint256", "bytes32"],
      [payee, amount, BigInt(now), randomNonce()],
    ),
  );
  const wallet = getWalletClient(privateKey("TREASURY_PRIVATE_KEY"));
  const hash = await wallet.writeContract({
    address: registryAddress(),
    abi: registryAbi,
    functionName: "open",
    args: [invoiceId, payee, amount, validAfter, validBefore, payerHint(hintPhone)],
  });
  await getPublicClient().waitForTransactionReceipt({ hash });
  rememberInvoice({ invoiceId, note: "p2p", openTx: hash });
  return invoiceId;
}

export async function payToUser(opts: {
  fromPhone: string;
  payee: P2pUser;
  amount: bigint;
}): Promise<SettleResult | { ok: false; reason: string; detail: string }> {
  const sender = findByPhone(opts.fromPhone);
  if (!sender) {
    return { ok: false, reason: "not_activated", detail: "Sender has not activated" };
  }
  const payee = opts.payee;
  if (payee.phone === sender.phone) {
    return { ok: false, reason: "self_pay", detail: "Cannot pay yourself" };
  }
  if (payee.address.toLowerCase() === USDT_E_DO_NOT_USE.toLowerCase()) {
    return { ok: false, reason: "wrong_token", detail: "USDT.e blocked" };
  }
  const allowed = await ensureAllowlisted(sender);
  if (!allowed) {
    return { ok: false, reason: "payer_not_allowed", detail: "Payer not allowlisted" };
  }
  const invoiceId = await openEnvelope(payee.address, opts.amount, opts.fromPhone);
  return settleInvoice({
    invoiceId,
    from: sender.address,
    to: payee.address,
    value: opts.amount,
    fromKey: custodyKeyForIndex(sender.index),
  });
}
