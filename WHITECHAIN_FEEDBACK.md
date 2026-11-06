# Whitechain feedback — USend (ETHGlobal Mumbai)

Regular track. Scale. Simulated USSD. Prize USDT on 1874. No World ID.

## What we built

A merchant till the payer approves on a USSD-like phone screen. PIN authorizes
an EIP-3009 TransferWithAuthorization. Our relayer submits GhostGateway.settle
and pays WBT gas. Settlement token is 0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7.

## What worked

- Faucet UI (time, GitHub handle, tx): **could not complete unattended 6 Nov 2026 ~12:10 EAT**. Page is GitHub OAuth + Cloudflare captcha at https://faucet.testnet.whitechain.io. No API. Needs Samuel in a browser, GitHub ≥ 30 days. Separately, treasury `0x94dfC5579Cdb819112927650D2edB58DDAf4636d` received **2 WBT** from `0xf203217d375e2ae535e0527a623150a32fe8f508` in [0x3b0ba0…](https://explorer.testnet.whitechain.io/tx/0x3b0ba0103b4e88fa95c98eedf14d080265abb9c58caa3120fdb1aeb176e00017) ~09:14 UTC. We used that for deploy + 0.05 WBT relayer top-up, not the GitHub faucet form.
- Public RPC / viem `whitechainSepolia`: RPC `https://rpc.testnet.whitechain.io` returned chain id `0x752` (1874). Prize USDT `name()` = `Tether USD`, 6 decimals. `version()` reverts; EIP-712 version recovered from `DOMAIN_SEPARATOR` as `"1"`.
- Explorer verification: GhostInvoiceRegistry `0x7a11BF706e315F5f677Cd5c988b721e578494Cca` and GhostGateway `0xf7Abc80Ff95113CE6386554bB1287D11b05A4052` verified on Blockscout (`--verifier-url …/api/`).
- EIP-3009 on the named USDT (name/version we read on-chain): name `Tether USD`, version `1`, `transferWithAuthorization` present. We do not call `receiveWithAuthorization` (msg.sender == to).
- ~1s blocks: deploy, WBT transfers, and S1 settle confirmed quickly.
- Prize USDT: no faucet. Swapped WBT → `0xcedf…55a7` on YetiTrade (docs.yetitrade.fi lists that address as verified USDT). Then operator cash-in to the demo payer and `GhostGateway.settle`. Qualification tx [0x950d71…](https://explorer.testnet.whitechain.io/tx/0x950d71a8679c13c779a8b1b2ac6f81052387719bb7dbeb6dce4712580e2b1b92). Did not mint. Did not use USDT.e.

## Where we got stuck

- Obtaining prize USDT (faucet is WBT-only): docs never name a drip. We swapped WBT on YetiTrade instead. Owner of the proxy is `0x8790832Ba493Cc16a4dBC5c961B0C4950632799c` — we are not the owner, so we did not mint. Did not touch USDT.e `0xaa7962d073935D387e8d442DA1D7149C81388f46`.
- USDT.e 0xaa79… vs prize USDT confusion: prize page names `0xcedf…55a7`. Portal/token-list `USDT.e` is a different contract.
- RPC 50 rps / venue NAT faucet IP limit: not hit yet (no faucet claim).
- Blockscout verify: succeeded with `solc 0.8.30`, `evm_version = prague`, `/api/` suffix, ABI-encoded constructor args. Gateway verify sat in queue ~15s then passed.
- EIP-3009 domain or receiveWithAuthorization msg.sender == to: domain recovered; gateway uses `transferWithAuthorization`.
- Reown/embedded wallet if anyone tried it (we should not have): not used. Payer UI has no wallet connect.

## What the docs were missing

- USDT drip / how hackathon teams get prize USDT: still missing from Whitechain docs. YetiTrade tokens page does name `0xcedf…55a7` and says swap WBT for it. Easy to miss; we spent hours looking at the WBT-only faucet first.
- Prize token vs token-list USDT.e: easy to pay the wrong one.
- Prize page still says “mainnet arriving in November” while mainnet 1875 has been live since 26 Oct 2026.
- Any broken deploy/verify step: n/a until WBT.

## What we faked on purpose

- Telco USSD transport (web phone frame / optional AT sandbox).
- Demo cash-in of test USDT (operator credit once we hold prize USDT).
- Faucet as stand-in for buying WBT.

## What we did not do

World ID, GoodDollar, WB Soul, mainnet 1875, real MNO, ERC-4337, refunds.
