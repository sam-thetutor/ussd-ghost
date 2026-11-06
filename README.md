# USSD Ghost

Kiosk till payments the payer approves like USSD. They never open a crypto app,
never hold WBT, never see a seed or a chain. A relayer pays gas in WBT.
Settlement is prize USDT on Whitechain Sepolia.

**USSD is simulated.** The `/phone` screen is a web feature-phone frame, not a
live Safaricom / Airtel / MTN session. Settlement on Whitechain is real.

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

- `/phone` — payer USSD simulator (CON/END). No chain UI.
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
- GhostInvoiceRegistry: _fill after verify_
- GhostGateway: _fill after verify_
- Relayer: 0x52e943E064FaBB1CE317936518F1C8dEc769a36c
- Treasury: 0x94dfC5579Cdb819112927650D2edB58DDAf4636d
- Merchant payee: 0xBF3578826CB053c29fd68BD2AD599401BCc14741
- Demo payer EOA (ops / debug only, never `/phone`): 0x5690A6E8a3882C333f7E8451a3387a0C4a13d001
- Deployer: 0x3C2150495B277058921CEA9D87132f6168Dc4c2d
- Qualification payment: _the S1 explorer link_

Wrong token: `0xaa7962d073935D387e8d442DA1D7149C81388f46` is **USDT.e**. Paying it does not qualify.

## How to run

1. Copy `.env.example` → `.env.local`. Do not put private keys in `NEXT_PUBLIC_*`.
2. `npm install` && `npm run dev`
3. Open /phone /till /ops. Dial *384*71# on /phone.
4. Contracts: Foundry, see foundry.toml. Verify via Blockscout API.

Demo till `123456` (Mama Amina Kiosk). Demo MSISDN `+254700000001`. Demo PIN is documented in `/ops` after login, not on `/phone`.

## Gas, WBT, anti-drain

The business pays gas. Faucet WBT (0.5 / 24h, GitHub ≥ 30 days) lands in
treasury, then a small top-up to the relayer. Relayer holds WBT only and may
only submit registered invoices through GhostGateway. Junk authorizations are
dropped in /ops before a transaction is sent. Hot balance is kept small.

Production analog: buy WBT on the WhiteBIT / Whitechain rail. Test WBT has no
monetary value.

## Limitations

- No live MNO shortcode.
- Payer keys are custodied after PIN (mobile-money shaped).
- Demo USDT in the payer EOA is operator cash-in; there is no USDT faucet.
- No cash-out, no licensed agent network, no World ID, no refunds this weekend.

See WHITECHAIN_FEEDBACK.md.
