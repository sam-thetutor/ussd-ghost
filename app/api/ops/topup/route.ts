import { parseEther } from "viem";
import { explorerTx } from "@/lib/addresses";
import { getPublicClient, getWalletClient } from "@/lib/chain";
import { privateKey } from "@/lib/keys";
import { checkOpsPassword } from "@/lib/pin";
import {
  RATE,
  clientIp,
  jsonRateLimited,
  rateLimit,
} from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(
    `ops:write:${clientIp(request)}`,
    RATE.opsWrite.limit,
    RATE.opsWrite.windowMs,
  );
  if (!limited.ok) return jsonRateLimited(limited);
  const password = request.headers.get("x-ops-password");
  if (!checkOpsPassword(password, "OPS_PASSWORD")) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const relayer = process.env.RELAYER_ADDRESS as `0x${string}` | undefined;
  if (!relayer) {
    return Response.json({ error: "RELAYER_ADDRESS missing" }, { status: 500 });
  }
  const treasury = getWalletClient(privateKey("TREASURY_PRIVATE_KEY"));
  const hash = await treasury.sendTransaction({
    to: relayer,
    value: parseEther("0.05"),
  });
  await getPublicClient().waitForTransactionReceipt({ hash });
  return Response.json({ txHash: hash, explorer: explorerTx(hash), amountWbt: "0.05" });
}
