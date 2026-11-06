# USSD Ghost

Kiosk till payments the payer approves like USSD. They never open a crypto app,
never hold WBT, never see a seed or a chain. A relayer pays gas in WBT.
Settlement is prize USDT on Whitechain Sepolia.

**USSD is simulated.** Africa's Talking sandbox + `/phone` are simulators, not a
live MNO session. Settlement on Whitechain is real. We are not integrated with
a national operator.

Regular track · ETHGlobal Mumbai · Whitechain Scale · Payments Nobody Notices.

## Why on-chain USDT on Whitechain (not a national USSD rail)

A regular domestic USSD rail pays local currency on a national switch, is often
reversible by social-engineering “send it back” scripts, and does not give a
cross-border merchant a non-reversible USDT receipt. SSA smartphone penetration
is about 54%; 25 of 36 African instant-payment systems still support USSD; 40%
of SSA adults have a mobile-money account but only 20% made a digital merchant
payment in 2024. This demo keeps the payer on a phone-number + PIN mental model
and lands prize USDT on Whitechain Sepolia (chain ID 1874) for the merchant.

We are not claiming to beat Remittance Prices Worldwide corridor averages, and
we are not a licensed PSP.

## Architecture

- Africa's Talking sandbox — **primary payer path** (simulator, not a live MNO). Callback `POST /api/ussd`.
- `/phone` — backup web feature-phone. Same engine. No chain UI.
- `/till` — Mama Amina kiosk. Invoice + explorer receipt.
- `/ops` — treasury → relayer WBT, allowlist, drain drill, demo cash-in.
- `GhostInvoiceRegistry` + `GhostGateway` on 1874.
- Server-custodied payer EOA signs EIP-3009 `TransferWithAuthorization` after PIN.
- Relayer EOA submits `GhostGateway.settle` and pays WBT gas.

## Chain and token

- Network: Whitechain Sepolia, chain ID 1874
- RPC: https://rpc.testnet.whitechain.io
- Explorer: https://explorer.testnet.whitechain.io
- Faucet: https://faucet.testnet.whitechain.io — 0.5 WBT / 24h, GitHub ≥ 30 days; WBT only
- Prize USDT: 0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7
- GhostInvoiceRegistry: [0x7a11BF706e315F5f677Cd5c988b721e578494Cca](https://explorer.testnet.whitechain.io/address/0x7a11BF706e315F5f677Cd5c988b721e578494Cca) (verified)
- GhostGateway: [0xf7Abc80Ff95113CE6386554bB1287D11b05A4052](https://explorer.testnet.whitechain.io/address/0xf7Abc80Ff95113CE6386554bB1287D11b05A4052) (verified)
- Relayer: [0x52e943E064FaBB1CE317936518F1C8dEc769a36c](https://explorer.testnet.whitechain.io/address/0x52e943E064FaBB1CE317936518F1C8dEc769a36c)
- Treasury: [0x94dfC5579Cdb819112927650D2edB58DDAf4636d](https://explorer.testnet.whitechain.io/address/0x94dfC5579Cdb819112927650D2edB58DDAf4636d)
- Merchant payee: [0xBF3578826CB053c29fd68BD2AD599401BCc14741](https://explorer.testnet.whitechain.io/address/0xBF3578826CB053c29fd68BD2AD599401BCc14741)
- Demo payer EOA (ops / debug only, never `/phone`): 0x5690A6E8a3882C333f7E8451a3387a0C4a13d001
- Deployer: 0x3C2150495B277058921CEA9D87132f6168Dc4c2d
- **Qualification payment (S1):** 10 prize USDT, payer → Mama Amina via `GhostGateway.settle` (relayer paid WBT gas): [0x950d71a8679c13c779a8b1b2ac6f81052387719bb7dbeb6dce4712580e2b1b92](https://explorer.testnet.whitechain.io/tx/0x950d71a8679c13c779a8b1b2ac6f81052387719bb7dbeb6dce4712580e2b1b92). Invoice open: [0x0e9260…](https://explorer.testnet.whitechain.io/tx/0x0e9260ff0616b0c5d256fa492a99d4b0bcee69c55c42e18a87d4b9041c2dc52b). Cash-in 15 USDT treasury → demo payer: [0xed7701…](https://explorer.testnet.whitechain.io/tx/0xed77011c960ec98fe7b301ff6b236ac1a373c5a6f53d962dcf69f7a61e61a87c). Token is prize USDT `0xcedf…55a7`, not a self-minted token, not USDT.e.
- Prize USDT source: swapped native WBT on YetiTrade WWBT/USDT 0.3% pool (not a faucet): [0xc22b0b…](https://explorer.testnet.whitechain.io/tx/0xc22b0b1546ff5825681d61859039e690f87f49c414b2f3c84218987be3e25ee1) then [0xdfe2e4…](https://explorer.testnet.whitechain.io/tx/0xdfe2e48a455162399783c2d94ffd58ef797f9c6ae55da7a9e73ee92c33750bc3).
- Treasury WBT source: 2 WBT from faucet dispenser `0xf203217d375e2ae535e0527a623150a32fe8f508` in [0x3b0ba0…](https://explorer.testnet.whitechain.io/tx/0x3b0ba0103b4e88fa95c98eedf14d080265abb9c58caa3120fdb1aeb176e00017). Relayer top-ups: [0x90f69e…](https://explorer.testnet.whitechain.io/tx/0x90f69ec5547c717704ed8e50a43f2cc6d79d7f63c31a92d6a9819b14512516ba) (0.05) then [0xa4c4e4…](https://explorer.testnet.whitechain.io/tx/0xa4c4e47ed105a5b0cc58f50d964785586e62ae7c50508d27eecdd4ca78e1315d) (0.05). Relayer already had 0.1 WBT for S1; no extra top-up.

Wrong token: `0xaa7962d073935D387e8d442DA1D7149C81388f46` is **USDT.e**. Paying it does not qualify.

## How to run

1. Copy `.env.example` → `.env.local`. Do not put private keys in `NEXT_PUBLIC_*`.
2. `npm install` && `npm run dev`
3. Primary: Africa's Talking sandbox simulator (steps below). Backup: `/phone` dial `*384*71#`.
4. Merchant `/till`, operator `/ops`.
5. Contracts: Foundry, see foundry.toml. Verify via Blockscout API.

Demo till `123456` (Mama Amina Kiosk). Demo MSISDN `+254700000001` (any AT sandbox number still debits this custodied EOA after PIN). Demo PIN `2580` (shown in `/ops` after login, never on `/phone`).

Public repo: https://github.com/sam-thetutor/ussd-ghost

## Africa's Talking sandbox (Path C — primary payer, still a simulator)

Callback URL (paste this in the AT dashboard, public HTTPS):

`https://kits-bridges-euro-counters.trycloudflare.com/api/ussd`

`POST application/x-www-form-urlencoded` with `sessionId`, `phoneNumber`, `networkCode`, `serviceCode`, `text`. First hop has empty `text`. Reply is `text/plain` starting with `CON ` or `END `. USSD simulator — not a live MNO session.

Samuel must click (we cannot log into AT for you):

1. Sign up / open the **Sandbox** app (not live): https://account.africastalking.com/apps/sandbox
2. Create an API key if the dashboard asks (the phone does not send it; the dashboard may).
3. **Sandbox → USSD → Create channel.** Pick a channel (example `71`). Copy the **exact** service code the dashboard prints (often like `*384*71#`). Do not invent it.
4. Set **callback / invoke URL** to `https://kits-bridges-euro-counters.trycloudflare.com/api/ussd`
5. Open https://simulator.africastalking.com:1517/ — AT is explicit: sandbox traffic is in this web simulator, **not a handset**.
6. Register a phone number. Prefer `+254700000001`. If “already in use,” pick another; PIN still settles the demo payer EOA.
7. Launch the simulated device → **USSD** → type **`*384*71618#`** (shared `*384#` + channel `71618`). Not `*384#` (that is AT’s default “You have reached Africa's Talking USSD Services”). Not `71618` alone.
8. On `/till`, open a 5.00 or 10.00 invoice first. Then Pay merchant → till `123456` → amount → PIN `2580`.

Backup web phone (same `/api/ussd`): https://kits-bridges-euro-counters.trycloudflare.com/phone  
Till: https://kits-bridges-euro-counters.trycloudflare.com/till  
Ops: https://kits-bridges-euro-counters.trycloudflare.com/ops  
ngrok backup (browsers may see an interstitial; AT servers may not send the skip header, so **do not** use ngrok as the AT callback): https://958f-115-242-77-215.ngrok-free.app/phone

Vercel CLI is not logged in on this machine. If the Cloudflare tunnel URL rotates, update the AT dashboard callback.

## Gas, WBT, anti-drain

The business pays gas. Faucet WBT (0.5 / 24h, GitHub ≥ 30 days) lands in
treasury, then a small top-up to the relayer. Relayer holds WBT only and may
only submit registered invoices through GhostGateway. Junk authorizations are
dropped in /ops before a transaction is sent. Hot balance is kept small.

Production analog: buy WBT on the WhiteBIT / Whitechain rail. Test WBT has no
monetary value.

## Limitations

- No live MNO shortcode. Africa's Talking here is sandbox-only.
- Payer keys are custodied after PIN (mobile-money shaped).
- Demo USDT in the payer EOA is operator cash-in from treasury (treasury bought it by swapping WBT on YetiTrade). There is no USDT faucet.
- No cash-out, no licensed agent network, no World ID, no refunds this weekend.

See WHITECHAIN_FEEDBACK.md.
