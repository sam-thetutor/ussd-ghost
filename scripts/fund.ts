import { formatEther, parseEther } from "viem";
import { getPublicClient, getWalletClient } from "../lib/chain";
import { privateKey } from "../lib/keys";

async function main() {
  const client = getPublicClient();
  const treasury = getWalletClient(privateKey("TREASURY_PRIVATE_KEY"));
  const deployer = process.env.DEPLOYER_ADDRESS as `0x${string}`;
  const relayer = process.env.RELAYER_ADDRESS as `0x${string}`;
  const h1 = await treasury.sendTransaction({ to: deployer, value: parseEther("0.1") });
  await client.waitForTransactionReceipt({ hash: h1 });
  const h2 = await treasury.sendTransaction({ to: relayer, value: parseEther("0.05") });
  await client.waitForTransactionReceipt({ hash: h2 });
  console.log("fund-deployer", h1);
  console.log("fund-relayer", h2);
  console.log("treasury", formatEther(await client.getBalance({ address: treasury.account.address })));
  console.log("deployer", formatEther(await client.getBalance({ address: deployer })));
  console.log("relayer", formatEther(await client.getBalance({ address: relayer })));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
