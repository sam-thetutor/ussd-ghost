import { formatEther, formatUnits } from "viem";
import { usdtAbi } from "../lib/abi";
import { PRIZE_USDT } from "../lib/addresses";
import { getPublicClient } from "../lib/chain";

async function main() {
  const client = getPublicClient();
  const names = ["TREASURY", "RELAYER", "PAYER", "MERCHANT", "DEPLOYER"] as const;
  console.log("chain 1874 prize USDT", PRIZE_USDT);
  for (const name of names) {
    const envName = name === "MERCHANT" ? "MERCHANT_PAYEE" : `${name}_ADDRESS`;
    const address = process.env[envName] as `0x${string}` | undefined;
    if (!address) {
      console.log(name, "missing");
      continue;
    }
    const [wbt, usdt] = await Promise.all([
      client.getBalance({ address }),
      client.readContract({
        address: PRIZE_USDT,
        abi: usdtAbi,
        functionName: "balanceOf",
        args: [address],
      }),
    ]);
    console.log(
      `${name} ${address}  WBT=${formatEther(wbt)}  USDT=${formatUnits(usdt, 6)}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
