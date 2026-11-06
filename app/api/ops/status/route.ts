import { formatEther, formatUnits } from "viem";
import { usdtAbi } from "@/lib/abi";
import { explorerAddress, PRIZE_USDT } from "@/lib/addresses";
import { getPublicClient } from "@/lib/chain";
import { demoPayerAddress } from "@/lib/demo-state";
import { allowlistAddresses } from "@/lib/policy";
import { listRejects } from "@/lib/reject-log";
import { checkOpsPassword } from "@/lib/pin";

function addr(name: string): `0x${string}` | null {
  const value = process.env[name];
  return value ? (value as `0x${string}`) : null;
}

export async function GET(request: Request) {
  const password = request.headers.get("x-ops-password");
  if (!checkOpsPassword(password, "OPS_PASSWORD")) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const client = getPublicClient();
  const treasury = addr("TREASURY_ADDRESS");
  const relayer = addr("RELAYER_ADDRESS");
  const payer = demoPayerAddress();
  const merchant = addr("MERCHANT_PAYEE");

  async function wbt(a: `0x${string}` | null) {
    if (!a) return "0";
    return formatEther(await client.getBalance({ address: a }));
  }
  async function usdt(a: `0x${string}` | null) {
    if (!a) return "0";
    const bal = await client.readContract({
      address: PRIZE_USDT,
      abi: usdtAbi,
      functionName: "balanceOf",
      args: [a],
    });
    return formatUnits(bal, 6);
  }

  const [treasuryWbt, relayerWbt, payerWbt, relayerUsdt, payerUsdt, merchantUsdt, treasuryUsdt] =
    await Promise.all([
      wbt(treasury),
      wbt(relayer),
      wbt(payer),
      usdt(relayer),
      usdt(payer),
      usdt(merchant),
      usdt(treasury),
    ]);

  return Response.json({
    banner: "USSD simulator — not a live MNO session.",
    chainId: 1874,
    prizeUSDT: PRIZE_USDT,
    faucet: {
      url: "https://faucet.testnet.whitechain.io",
      drip: "0.5 WBT / 24h",
      githubDays: 30,
      lastClaim: null,
      note: "GitHub OAuth + Cloudflare captcha. Claim to treasury. Does not drip USDT.",
    },
    balances: {
      treasuryWbt,
      relayerWbt,
      payerWbt,
      relayerUsdt,
      payerUsdt,
      merchantUsdt,
      treasuryUsdt,
    },
    addresses: {
      treasury,
      relayer,
      payer,
      merchant,
      explorerTreasury: treasury ? explorerAddress(treasury) : null,
      explorerRelayer: relayer ? explorerAddress(relayer) : null,
      explorerPayer: explorerAddress(payer),
    },
    relayerJob:
      "Holds WBT only. Never holds USDT. Only submits GhostGateway.settle → prize USDT transferWithAuthorization against a registered invoice.",
    allowlist: allowlistAddresses(),
    rejects: listRejects(),
    demoPinHint: "2580",
    demoTill: process.env.DEMO_TILL || "123456",
    demoPhone: process.env.DEMO_PHONE || "+254700000001",
  });
}
