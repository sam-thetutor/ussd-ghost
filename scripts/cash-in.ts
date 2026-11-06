import { formatUnits, parseUnits } from "viem";
import { usdtAbi } from "../lib/abi";
import { explorerTx, PRIZE_USDT } from "../lib/addresses";
import { getPublicClient, getWalletClient } from "../lib/chain";
import { demoPayerAddress } from "../lib/demo-state";
import { privateKey } from "../lib/keys";

async function main() {
  const amount = parseUnits(process.argv[2] || "20", 6);
  const client = getPublicClient();
  const treasury = getWalletClient(privateKey("TREASURY_PRIVATE_KEY"));
  const payer = demoPayerAddress();
  const bal = await client.readContract({
    address: PRIZE_USDT,
    abi: usdtAbi,
    functionName: "balanceOf",
    args: [treasury.account.address],
  });
  console.log("treasury prize USDT", formatUnits(bal, 6));
  if (bal < amount) {
    console.error(
      "BLOCKED: no prize USDT to cash-in. Faucet does not drip USDT. Booth / Discord for 0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7. Not USDT.e.",
    );
    process.exit(1);
  }
  const hash = await treasury.writeContract({
    address: PRIZE_USDT,
    abi: usdtAbi,
    functionName: "transfer",
    args: [payer, amount],
  });
  await client.waitForTransactionReceipt({ hash });
  console.log("cash-in", explorerTx(hash));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
