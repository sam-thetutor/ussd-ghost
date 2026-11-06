import { parseUnits } from "viem";
import { usdtAbi } from "@/lib/abi";
import { explorerTx, PRIZE_USDT } from "@/lib/addresses";
import { getPublicClient, getWalletClient } from "@/lib/chain";
import { demoPayerAddress } from "@/lib/demo-state";
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
  const body = (await request.json().catch(() => ({}))) as { amount?: string };
  const amount = parseUnits(body.amount || "20", 6);
  const treasury = getWalletClient(privateKey("TREASURY_PRIVATE_KEY"));
  const payer = demoPayerAddress();
  const client = getPublicClient();
  const treasuryUsdt = await client.readContract({
    address: PRIZE_USDT,
    abi: usdtAbi,
    functionName: "balanceOf",
    args: [treasury.account.address],
  });
  if (treasuryUsdt < amount) {
    return Response.json(
      {
        error:
          "Treasury prize USDT is 0. The WBT faucet does not drip USDT. Ask the Whitechain booth or Discord for 0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7 on chain 1874. Do not mint a fake USDT. Do not use USDT.e.",
        treasuryUsdt: treasuryUsdt.toString(),
      },
      { status: 409 },
    );
  }
  const hash = await treasury.writeContract({
    address: PRIZE_USDT,
    abi: usdtAbi,
    functionName: "transfer",
    args: [payer, amount],
  });
  await client.waitForTransactionReceipt({ hash });
  return Response.json({
    txHash: hash,
    explorer: explorerTx(hash),
    amount: body.amount || "20",
    label: "Demo cash-in (operator credit, not a licensed CICO network, not a faucet)",
  });
}
