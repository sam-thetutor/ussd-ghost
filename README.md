# USend

**Sending stablecoins using USSD codes.**

The payer never opens a crypto app, never holds WBT, never sees a seed or a
chain. Dial a shortcode. Activate. Get a numeric code. Send to someone else’s
code. A relayer pays gas in WBT. Settlement is **prize USDT** on Whitechain
Sepolia. GitHub repo remains `ussd-ghost`.

**Africa’s Talking is sandbox, not a live MNO.** Dial `*384*71618#` in the web
simulator. `/phone` is a backup keypad. Neither is Safaricom or Airtel.
Settlement on Whitechain is real. We are not a licensed PSP.

Regular track · ETHGlobal Mumbai · Whitechain Scale · Payments Nobody Notices.

Public repo: https://github.com/sam-thetutor/ussd-ghost · PR #1  
API: [docs/API.md](docs/API.md)

## Honest sandbox

| Surface | What it is | What it is not |
| --- | --- | --- |
| `*384*71618#` | AT sandbox channel `71618` on shared `*384#` | Live telco shortcode |
| Simulator | https://simulator.africastalking.com:1517/ | A physical handset |
| Callback | `POST /api/ussd` | An MNO switch |
| Prize USDT | `0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7` | A token we minted; **USDT.e** `0xaa79…8f46` |

Dial `*384#` alone and AT shows its default page — the callback never runs.
Use `*384*71618#`.

## Architecture

```
Payer (AT simulator) --POST /api/ussd--> USend
  Activate: MSISDN → HD custodied EOA + numeric code, GhostGateway.setPayer
  Send: code + amount + PIN
    → auto-open GhostInvoiceRegistry invoice (15 min, payee = their address)
    → EIP-3009 transferWithAuthorization (custodied key)
    → Relayer GhostGateway.settle (relayer pays WBT)
Prize USDT moves payer → payee. Relayer USDT stays 0. Gateway holds no float.
```

- **USSD menu:** `1. Send` / `2. Activate` / `3. Balance` / `0. Exit`
- **P2P envelope:** no new Solidity. Same registry + gateway as merchant tills.
- **`/till`:** Mama Amina can still open a merchant invoice.
- **`/ops`:** WBT top-up, allowlist, drain drill (junk never broadcast), cash-in (transfer, not mint).
- **`/phone`:** backup web phone, same `/api/ussd` engine. Not featured.

## Setup

```bash
cp .env.example .env.local   # never put keys in NEXT_PUBLIC_*
npm install
npm run dev                  # http://localhost:3000
```

Foundry contracts live in `contracts/`. Already deployed and verified on 1874.
Do not mint prize USDT. Do not send USDT.e.

Demo:

| Phone | Code | Role |
| --- | --- | --- |
| `+254700000001` | `880001` | Funded demo payer (custodied index 0) |
| `+254700000002` | `880002` | Second HD wallet |
| PIN | `2580` | `/ops` after login; never on `/phone` |
| Till | `123456` | Mama Amina `/till` |

## Chain, token, contracts

- Network: Whitechain Sepolia, chain ID **1874**
- RPC: https://rpc.testnet.whitechain.io
- Explorer: https://explorer.testnet.whitechain.io
- Faucet: https://faucet.testnet.whitechain.io — **0.5 WBT / 24h only**. No USDT drip.
- Prize USDT: [`0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7`](https://explorer.testnet.whitechain.io/token/0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7)
- GhostInvoiceRegistry: [`0x7a11BF706e315F5f677Cd5c988b721e578494Cca`](https://explorer.testnet.whitechain.io/address/0x7a11BF706e315F5f677Cd5c988b721e578494Cca) (verified)
- GhostGateway: [`0xf7Abc80Ff95113CE6386554bB1287D11b05A4052`](https://explorer.testnet.whitechain.io/address/0xf7Abc80Ff95113CE6386554bB1287D11b05A4052) (verified)
- Relayer (WBT only): [`0x52e943E064FaBB1CE317936518F1C8dEc769a36c`](https://explorer.testnet.whitechain.io/address/0x52e943E064FaBB1CE317936518F1C8dEc769a36c)
- Treasury / backendSigner: [`0x94dfC5579Cdb819112927650D2edB58DDAf4636d`](https://explorer.testnet.whitechain.io/address/0x94dfC5579Cdb819112927650D2edB58DDAf4636d)
- Demo payer / 880001: `0x5690A6E8a3882C333f7E8451a3387a0C4a13d001`
- 880002: `0x63B2a5827e9e4539db09aE21E7A49ECf2DBA698E`
- Merchant: `0xBF3578826CB053c29fd68BD2AD599401BCc14741`
- Deployer: `0x3C2150495B277058921CEA9D87132f6168Dc4c2d`

`GhostGateway.settle` checks: invoice Open, `to == payee`, `value == amount`, `from` on `payerAllowed`, amount ≤ 100 prize USDT. Relayer submits; payer WBT = 0.

Wrong token: `0xaa7962d073935D387e8d442DA1D7149C81388f46` is **USDT.e**. Paying it does not qualify.

## API (summary)

Full contract: [docs/API.md](docs/API.md).

| Method | Path | Auth | Limit | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/ussd` | AT form body | 20/min phone, 40/min IP | `CON`/`END` text/plain. HTTP 200 even when limited. |
| GET | `/api/ussd` | none | same | Help `END`. |
| POST | `/api/invoices` | none (till) | 8/min IP | Open merchant invoice. 429 JSON if limited. |
| GET | `/api/invoices` | none | 60/min IP | List / `?id=` |
| GET | `/api/ops/status` | `x-ops-password` | 60/min IP | Balances, allowlist |
| POST | `/api/ops/cashin` | ops | 8/min IP | Treasury **transfer** prize USDT. No mint. |
| POST | `/api/ops/topup` | ops | 8/min IP | 0.05 WBT → relayer |
| POST | `/api/ops/drain` | ops | 8/min IP | Reject junk before broadcast |

AT POST fields: `sessionId`, `phoneNumber`, `networkCode`, `serviceCode`, `text`. First hop `text=""`. P2P hops: `2` activate, `1*{code}*{amount}*{pin}` send.

Rate limiter is an in-process sliding window (`lib/rate-limit.ts`). Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`.

## P2P USSD

1. Dial `*384*71618#`.
2. `2` Activate → unique code + prize USDT balance (hidden HD wallet).
3. `1` Send → their code → amount → PIN.
4. Backend opens a 15-minute invoice to their address, then `GhostGateway.settle`.
5. `3` Balance. `0` Exit. Hang up ends the session (shared-phone property).

## Proven transactions (prize USDT, not minted, not USDT.e)

- **S1 qualification:** 10 prize USDT payer → Mama Amina `GhostGateway.settle`: [0x950d71…](https://explorer.testnet.whitechain.io/tx/0x950d71a8679c13c779a8b1b2ac6f81052387719bb7dbeb6dce4712580e2b1b92). Invoice open [0x0e9260…](https://explorer.testnet.whitechain.io/tx/0x0e9260ff0616b0c5d256fa492a99d4b0bcee69c55c42e18a87d4b9041c2dc52b). Cash-in 15 USDT [0xed7701…](https://explorer.testnet.whitechain.io/tx/0xed77011c960ec98fe7b301ff6b236ac1a373c5a6f53d962dcf69f7a61e61a87c).
- **AT till settle:** 5.00 after `*384*71618#` → till `123456` → PIN, ref GHO-C9C1C810: [0x6bb4bd…](https://explorer.testnet.whitechain.io/tx/0x6bb4bd7dbe2dd257dfa636b15ff8a2f5896a4f6855c01407952081b258554a5a). Open [0x1f5da0…](https://explorer.testnet.whitechain.io/tx/0x1f5da0f5544ab4e503ade5b3498bdbc3843c1688f9876f2190e5cfe5d0f19c77).
- **P2P 880001 → 880002:** cash-in 5 prize USDT treasury → 880001: [0xf6506b…](https://explorer.testnet.whitechain.io/tx/0xf6506b4117cd9fd4d420b97da30c1cd9de9f3bab849975647a64f5043ca5588e). Then 1.00 via USSD Send, ref GHO-7E1F457B: [0x7cf34b…](https://explorer.testnet.whitechain.io/tx/0x7cf34b2aad8dfe8babbc93c08aa85f07919d39605d1ee4b14d3f1bec99e1d434). Envelope open [0xc2682b…](https://explorer.testnet.whitechain.io/tx/0xc2682b4234af83eb0fe0a953816b2a032afe3f10e1344b01c3c6f7d9967cb2a5). 880002 balance 1.00. Relayer paid WBT.
- Prize USDT source (YetiTrade WBT swap, not a faucet): [0xc22b0b…](https://explorer.testnet.whitechain.io/tx/0xc22b0b1546ff5825681d61859039e690f87f49c414b2f3c84218987be3e25ee1) then [0xdfe2e4…](https://explorer.testnet.whitechain.io/tx/0xdfe2e48a455162399783c2d94ffd58ef797f9c6ae55da7a9e73ee92c33750bc3).
- Treasury WBT faucet: [0x3b0ba0…](https://explorer.testnet.whitechain.io/tx/0x3b0ba0103b4e88fa95c98eedf14d080265abb9c58caa3120fdb1aeb176e00017). Relayer top-ups [0x90f69e…](https://explorer.testnet.whitechain.io/tx/0x90f69ec5547c717704ed8e50a43f2cc6d79d7f63c31a92d6a9819b14512516ba) then [0xa4c4e4…](https://explorer.testnet.whitechain.io/tx/0xa4c4e47ed105a5b0cc58f50d964785586e62ae7c50508d27eecdd4ca78e1315d).

## Africa’s Talking sandbox (primary payer)

Callback (public HTTPS, paste in the AT dashboard):

`https://kits-bridges-euro-counters.trycloudflare.com/api/ussd`

1. Sandbox app (not live): https://account.africastalking.com/apps/sandbox
2. **USSD → channel `71618`.** Service code is `*384*71618#`.
3. Callback URL = the `/api/ussd` line above.
4. Simulator: https://simulator.africastalking.com:1517/ — **not a handset**.
5. Register `+254700000001`. Launch USSD. Type **`*384*71618#`**.
6. `2` Activate. `1` Send → `880002` → amount → PIN `2580`.

Home: https://kits-bridges-euro-counters.trycloudflare.com  
Local: http://localhost:3000  
Backup `/phone`, till `/till`, ops `/ops`. If the Cloudflare URL rotates, update the AT dashboard.

## Why on-chain USDT (not a national USSD rail)

A domestic USSD rail pays local currency on a national switch, is often
reversible (“send it back”), and does not give a merchant a USDT receipt. SSA
smartphone penetration is about 54%; 25 of 36 African IPS still support USSD;
40% of SSA adults have mobile money but only 20% made a digital merchant
payment in 2024. USend keeps phone + PIN and lands prize USDT on 1874.

We are not claiming Remittance Prices Worldwide corridor wins.

## Gas and anti-drain

Faucet WBT → treasury → small hot relayer. Relayer holds WBT only and may only
`GhostGateway.settle` registered invoices. `/ops` drain drill rejects junk
before `eth_sendRawTransaction`. Rate limits cap USSD and invoice opens.

## Limitations

- No live MNO shortcode.
- Custodied keys after PIN (mobile-money shaped), not ERC-4337.
- No USDT faucet. Operator cash-in is a treasury **transfer**.
- No cash-out, no World ID, no refunds this weekend.

See `WHITECHAIN_FEEDBACK.md`.
