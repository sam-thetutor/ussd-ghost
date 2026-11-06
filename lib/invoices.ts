import type { Address, Hex } from "viem";
import { InvoiceStatus, registryAbi } from "./abi";
import { explorerTx, registryAddress } from "./addresses";
import { getPublicClient } from "./chain";

export type InvoiceRow = {
  invoiceId: Hex;
  amount: string;
  payee: Address;
  validAfter: number;
  validBefore: number;
  status: "none" | "open" | "paid" | "cancelled";
  note: string;
  openTx?: string;
  payTx?: string;
  explorerOpen?: string;
  explorerPay?: string;
};

const notes = new Map<string, { note: string; openTx?: string; payTx?: string }>();
const order: string[] = [];

const STATUS = ["none", "open", "paid", "cancelled"] as const;

export function rememberInvoice(row: {
  invoiceId: Hex;
  note?: string;
  openTx?: string;
  payTx?: string;
}) {
  const prev = notes.get(row.invoiceId) ?? { note: "" };
  notes.set(row.invoiceId, {
    note: row.note ?? prev.note,
    openTx: row.openTx ?? prev.openTx,
    payTx: row.payTx ?? prev.payTx,
  });
  if (!order.includes(row.invoiceId)) order.unshift(row.invoiceId);
}

export async function readInvoice(invoiceId: Hex): Promise<InvoiceRow | null> {
  const client = getPublicClient();
  const inv = await client.readContract({
    address: registryAddress(),
    abi: registryAbi,
    functionName: "getInvoice",
    args: [invoiceId],
  });
  if (inv.status === InvoiceStatus.None) return null;
  const extra = notes.get(invoiceId) ?? { note: "" };
  return {
    invoiceId,
    amount: inv.amount.toString(),
    payee: inv.payee,
    validAfter: Number(inv.validAfter),
    validBefore: Number(inv.validBefore),
    status: STATUS[inv.status] ?? "none",
    note: extra.note,
    openTx: extra.openTx,
    payTx: extra.payTx,
    explorerOpen: extra.openTx ? explorerTx(extra.openTx) : undefined,
    explorerPay: extra.payTx ? explorerTx(extra.payTx) : undefined,
  };
}

export async function listRememberedInvoices(): Promise<InvoiceRow[]> {
  const rows: InvoiceRow[] = [];
  for (const id of order) {
    try {
      const row = await readInvoice(id as Hex);
      if (row) rows.push(row);
    } catch {
      /* registry not ready */
    }
  }
  return rows;
}

export async function findOpenInvoice(payee: Address, amount: bigint): Promise<InvoiceRow | null> {
  const now = Math.floor(Date.now() / 1000);
  for (const id of order) {
    const row = await readInvoice(id as Hex);
    if (!row) continue;
    if (row.status !== "open") continue;
    if (row.payee.toLowerCase() !== payee.toLowerCase()) continue;
    if (BigInt(row.amount) !== amount) continue;
    if (now >= row.validBefore) continue;
    return row;
  }
  return null;
}
