import { encodePacked, formatEther, formatUnits, keccak256, parseUnits } from "viem";
import { registryAbi, usdtAbi } from "../lib/abi";
import { explorerTx, merchantPayee, PRIZE_USDT, registryAddress } from "../lib/addresses";
import { getPublicClient, getWalletClient } from "../lib/chain";
import { DEMO_PHONE, payerHint } from "../lib/demo-state";
import { randomNonce } from "../lib/eip3009";
import { privateKey } from "../lib/keys";
import { settleInvoice } from "../lib/relayer";

async function main() {
  const client = getPublicClient();
  const treasury = getWalletClient(privateKey("TREASURY_PRIVATE_KEY"));
  const payer = process.env.PAYER_ADDRESS as `0x${string}`;
  const payee = merchantPayee();
  const relayer = process.env.RELAYER_ADDRESS as `0x${string}`;

  const [payerWbt, payerUsdt, relayerWbt, treasuryUsdt] = await Promise.all([
    client.getBalance({ address: payer }),
    client.readContract({ address: PRIZE_USDT, abi: usdtAbi, functionName: "balanceOf", args: [payer] }),
    client.getBalance({ address: relayer }),
    client.readContract({
      address: PRIZE_USDT,
      abi: usdtAbi,
      functionName: "balanceOf",
      args: [treasury.account.address],
    }),
  ]);

  console.log("prize USDT", PRIZE_USDT);
  console.log("payer", payer, "WBT", formatEther(payerWbt), "USDT", formatUnits(payerUsdt, 6));
  console.log("relayer", relayer, "WBT", formatEther(relayerWbt));
  console.log("treasury USDT", formatUnits(treasuryUsdt, 6));

  if (payerUsdt < parseUnits("5", 6)) {
    console.error(
      "BLOCKED: demo payer has no prize USDT. Faucet is WBT-only. Do not mint a fake USDT. Do not use USDT.e 0xaa79…",
    );
    process.exit(1);
  }
  if (relayerWbt === BigInt(0)) {
    console.error("BLOCKED: relayer has 0 WBT. Claim faucet to treasury, then use the operator panel on the homepage.");
    process.exit(1);
  }

  const amount = parseUnits("5", 6);
  const now = Math.floor(Date.now() / 1000);
  const invoiceId = keccak256(
    encodePacked(["string", "uint256"], ["prove", BigInt(now)]),
  );
  const registry = registryAddress();
  const openHash = await treasury.writeContract({
    address: registry,
    abi: registryAbi,
    functionName: "open",
    args: [invoiceId, payee, amount, BigInt(0), BigInt(now + 900), payerHint(DEMO_PHONE)],
  });
  await client.waitForTransactionReceipt({ hash: openHash });
  console.log("invoice opened", explorerTx(openHash));

  const result = await settleInvoice({
    invoiceId,
    from: payer,
    to: payee,
    value: amount,
  });
  if (!result.ok) {
    console.error("settle failed", result);
    process.exit(1);
  }
  const payerWbtAfter = await client.getBalance({ address: payer });
  console.log("qualification", explorerTx(result.txHash), "ref", result.ref);
  console.log("payer WBT still", formatEther(payerWbtAfter), "(must be 0)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
