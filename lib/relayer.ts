import { type Address, type Hex, formatEther } from "viem";
import { gatewayAbi, InvoiceStatus, registryAbi, usdtAbi } from "./abi";
import {
  explorerTx,
  gatewayAddress,
  PRIZE_USDT,
  registryAddress,
} from "./addresses";
import { getPublicClient, getWalletClient } from "./chain";
import { demoPayerAddress, RELAYER_MIN_WBT } from "./demo-state";
import { signTransferWithAuthorization, randomNonce } from "./eip3009";
import { rememberInvoice } from "./invoices";
import { privateKey } from "./keys";
import { evaluatePolicy, type InvoiceView } from "./policy";
import { pushReject, type RejectReason } from "./reject-log";

export type SettleResult =
  | { ok: true; txHash: Hex; ref: string; invoiceId: Hex }
  | { ok: false; reason: RejectReason; detail: string };

function ghostRef(invoiceId: Hex): string {
  return `GHO-${invoiceId.slice(2, 10).toUpperCase()}`;
}

async function loadInvoice(invoiceId: Hex): Promise<InvoiceView | null> {
  const client = getPublicClient();
  const inv = await client.readContract({
    address: registryAddress(),
    abi: registryAbi,
    functionName: "getInvoice",
    args: [invoiceId],
  });
  if (inv.status === InvoiceStatus.None) return null;
  return {
    invoiceId,
    payee: inv.payee,
    amount: inv.amount,
    validAfter: inv.validAfter,
    validBefore: inv.validBefore,
    status: inv.status,
  };
}

export async function settleInvoice(opts: {
  invoiceId: Hex;
  from: Address;
  to: Address;
  value: bigint;
  drain?: boolean;
}): Promise<SettleResult> {
  if (opts.drain) {
    const entry = pushReject({
      reason: "drain_drill",
      detail: "Junk payload rejected before eth_sendRawTransaction",
      invoiceId: opts.invoiceId,
    });
    return { ok: false, reason: entry.reason, detail: entry.detail };
  }

  let registry: Address;
  let gateway: Address;
  try {
    registry = registryAddress();
    gateway = gatewayAddress();
  } catch {
    const entry = pushReject({
      reason: "contracts_unconfigured",
      detail: "REGISTRY_ADDRESS / GATEWAY_ADDRESS missing",
    });
    return { ok: false, reason: entry.reason, detail: entry.detail };
  }

  const publicClient = getPublicClient();
  const relayer = getWalletClient(privateKey("RELAYER_PRIVATE_KEY"));
  const relayerAddr = relayer.account.address;

  const [invoice, relayerWbt, paused, payerAllowed, payerUsdt] = await Promise.all([
    loadInvoice(opts.invoiceId),
    publicClient.getBalance({ address: relayerAddr }),
    publicClient.readContract({
      address: gateway,
      abi: gatewayAbi,
      functionName: "paused",
    }),
    publicClient.readContract({
      address: gateway,
      abi: gatewayAbi,
      functionName: "payerAllowed",
      args: [opts.from],
    }),
    publicClient.readContract({
      address: PRIZE_USDT,
      abi: usdtAbi,
      functionName: "balanceOf",
      args: [opts.from],
    }),
  ]);

  void registry;

  if (payerUsdt < opts.value) {
    const entry = pushReject({
      reason: "insufficient_usdt",
      detail: "Payer prize USDT below invoice amount",
      invoiceId: opts.invoiceId,
    });
    return { ok: false, reason: entry.reason, detail: entry.detail };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const nonce = randomNonce();
  const used = await publicClient.readContract({
    address: PRIZE_USDT,
    abi: usdtAbi,
    functionName: "authorizationState",
    args: [opts.from, nonce],
  });

  const reason = evaluatePolicy({
    invoice,
    from: opts.from,
    to: opts.to,
    value: opts.value,
    nowSec,
    relayerWbt,
    nonceUsed: used,
    paused,
    payerAllowed,
  });
  if (reason) {
    const entry = pushReject({
      reason,
      detail: `Policy rejected settle (relayer WBT ${formatEther(relayerWbt)})`,
      invoiceId: opts.invoiceId,
    });
    return { ok: false, reason: entry.reason, detail: entry.detail };
  }

  const validAfter = BigInt(0);
  const validBefore = BigInt(nowSec + 15 * 60);
  const signed = await signTransferWithAuthorization(privateKey("PAYER_CUSTODY_KEY"), {
    from: opts.from,
    to: opts.to,
    value: opts.value,
    validAfter,
    validBefore,
    nonce,
  });

  if (relayer.account.address.toLowerCase() === demoPayerAddress().toLowerCase()) {
    throw new Error("Relayer key must not be the payer key");
  }
  if (relayerWbt < RELAYER_MIN_WBT) {
    const entry = pushReject({
      reason: "relayer_wbt_low",
      detail: "Relayer WBT below 0.01; not sending",
    });
    return { ok: false, reason: entry.reason, detail: entry.detail };
  }

  const hash = await relayer.writeContract({
    address: gateway,
    abi: gatewayAbi,
    functionName: "settle",
    args: [
      opts.invoiceId,
      opts.from,
      opts.to,
      opts.value,
      validAfter,
      validBefore,
      nonce,
      signed.v,
      signed.r,
      signed.s,
    ],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  rememberInvoice({ invoiceId: opts.invoiceId, payTx: hash });
  return {
    ok: true,
    txHash: hash,
    ref: ghostRef(opts.invoiceId),
    invoiceId: opts.invoiceId,
  };
}

export function qualificationLink(txHash: Hex): string {
  return explorerTx(txHash);
}
