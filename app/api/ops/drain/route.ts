import { keccak256, stringToBytes } from "viem";
import { settleInvoice } from "@/lib/relayer";
import { merchantPayee } from "@/lib/addresses";
import { demoPayerAddress } from "@/lib/demo-state";
import { listRejects } from "@/lib/reject-log";
import { checkOpsPassword } from "@/lib/pin";

export async function POST(request: Request) {
  const password = request.headers.get("x-ops-password");
  if (!checkOpsPassword(password, "OPS_PASSWORD")) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const junkId = keccak256(stringToBytes(`drain-${Date.now()}`));
  const result = await settleInvoice({
    invoiceId: junkId,
    from: demoPayerAddress(),
    to: merchantPayee(),
    value: BigInt(5) * BigInt(1_000_000),
    drain: true,
  });
  return Response.json({ result, rejects: listRejects() });
}
