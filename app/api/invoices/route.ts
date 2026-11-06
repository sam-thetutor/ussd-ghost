import { encodePacked, keccak256, parseUnits, type Hex } from "viem";
import { registryAbi } from "@/lib/abi";
import { merchantPayee, registryAddress } from "@/lib/addresses";
import { getPublicClient, getWalletClient } from "@/lib/chain";
import { INVOICE_TTL_SEC, payerHint, DEMO_PHONE } from "@/lib/demo-state";
import { randomNonce } from "@/lib/eip3009";
import { listRememberedInvoices, readInvoice, rememberInvoice } from "@/lib/invoices";
import { privateKey } from "@/lib/keys";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  try {
    if (id) {
      const row = await readInvoice(id as Hex);
      return Response.json({ invoice: row });
    }
    const invoices = await listRememberedInvoices();
    return Response.json({ invoices });
  } catch (error) {
    const message = error instanceof Error ? error.message : "invoice read failed";
    return Response.json({ invoices: [], error: message }, { status: 200 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as { amount?: string; note?: string };
  if (!body.amount) {
    return Response.json({ error: "amount required" }, { status: 400 });
  }
  let amount: bigint;
  try {
    amount = parseUnits(body.amount, 6);
  } catch {
    return Response.json({ error: "bad amount" }, { status: 400 });
  }
  if (amount <= BigInt(0)) {
    return Response.json({ error: "amount must be positive" }, { status: 400 });
  }

  let registry: `0x${string}`;
  try {
    registry = registryAddress();
  } catch {
    return Response.json(
      { error: "REGISTRY_ADDRESS not set. Deploy contracts after faucet WBT lands." },
      { status: 503 },
    );
  }

  const payee = merchantPayee();
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
    address: registry,
    abi: registryAbi,
    functionName: "open",
    args: [invoiceId, payee, amount, validAfter, validBefore, payerHint(DEMO_PHONE)],
  });
  await getPublicClient().waitForTransactionReceipt({ hash });
  rememberInvoice({ invoiceId, note: body.note || "", openTx: hash });
  const invoice = await readInvoice(invoiceId);
  return Response.json({ invoice, txHash: hash });
}
