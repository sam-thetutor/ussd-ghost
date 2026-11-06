# USend API

Africa’s Talking sandbox callback and JSON helpers. **Not a live MNO.** Dial `*384*71618#` at https://simulator.africastalking.com:1517/. Settlement is prize USDT `0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7` on Whitechain Sepolia (1874). Do not mint. Do not pay USDT.e `0xaa7962d073935D387e8d442DA1D7149C81388f46`.

Live callback: `POST https://minds-birds-airport-dozens.trycloudflare.com/api/ussd`  
Local: `http://localhost:3000`

Rate limits are **real** (in-process sliding window). Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After` when blocked.

| Route | Limit | On exceed |
| --- | --- | --- |
| `POST /api/ussd` | 20 / 60s per phone, 40 / 60s per IP | HTTP **200** `END Try again. You were not charged.` (AT drops 40x) |
| `GET /api/ussd` | same as POST | same END body |
| `POST /api/invoices` | 8 / 60s per IP | HTTP **429** `{ "error": "rate_limited" }` |
| `GET /api/invoices` | 60 / 60s per IP | 429 |
| `POST /api/ops/cashin`, `/topup`, `/drain` | 8 / 60s per IP | 429 |
| `GET /api/ops/status` | 60 / 60s per IP | 429 |

## `POST /api/ussd` — Africa’s Talking callback

AT POSTs `application/x-www-form-urlencoded` (JSON also accepted). Always reply `text/plain`, HTTP 200, body starting with `CON ` or `END `. Budget ~10s.

| Field | Required | Notes |
| --- | --- | --- |
| `sessionId` | yes | AT session. Empty `text` is the first hop. |
| `phoneNumber` | yes | MSISDN, e.g. `+254700000001`. Maps to a custodied HD EOA after Activate. |
| `text` | yes (may be `""`) | Concatenated choices joined by `*`. |
| `serviceCode` | no | Default `*384*71618#`. |
| `networkCode` | no | Ignored. |

Header `at-ussd-hop-metadata` is a short hop label (WelcomeMenu, Activate, EnterCode, Settle, RateLimited, …).

### Menu (P2P)

```
USend
1. Send
2. Activate
3. Balance
0. Exit
```

| `text` | Reply |
| --- | --- |
| `""` | `CON` menu |
| `2` | `END Activated. Code {n}\nBal {usdt}` — issues unique numeric code, `setPayer` if needed |
| `3` | `END Code {n}\nBal {usdt}` — or `Dial 2 to activate.` |
| `1` | `CON Enter their code` (must be activated) |
| `1*{code}` | `CON Code {n}\nEnter amount` |
| `1*{code}*{amount}` | `CON Pay {amount} to {code}… Enter PIN` |
| `1*{code}*{amount}*{pin}` | `END Confirmed. … Ref GHO-…` or not-charged error |
| `0` | `END Thank you.` |

Demo: `+254700000001` → code `880001`. `+254700000002` → `880002`. PIN `2580` (ops only, never printed on `/phone`).

**Send path (envelope, no new Solidity):** lookup code → auto-open 15-minute `GhostInvoiceRegistry` invoice to that address → EIP-3009 `transferWithAuthorization` from sender’s custodied key → relayer `GhostGateway.settle` (relayer pays WBT). Failures return `END … You were not charged.`

`GET /api/ussd` returns a one-line help `END`.

## `GET /api/invoices` and `POST /api/invoices`

Merchant till invoices (Mama Amina `/till`). Payee is `MERCHANT_PAYEE`.

**GET** `?id=0x…` one invoice, or list remembered invoices.

**POST** JSON `{ "amount": "5.00", "note": "optional" }` — treasury (backendSigner) calls `registry.open`. Amount is prize USDT 6 decimals. TTL 15 minutes.

```json
{ "invoice": { "invoiceId": "0x…", "status": "open", "amount": "5000000", "payee": "0xBF35…" }, "txHash": "0x…" }
```

P2P send does **not** use this POST; the USSD engine opens the envelope itself.

## Ops JSON (password)

Header `x-ops-password` = `OPS_PASSWORD`.

| Method | Path | Effect |
| --- | --- | --- |
| GET | `/api/ops/status` | Balances, allowlist, rejects. Not a faucet. |
| POST | `/api/ops/cashin` | `{ "amount": "5" }` treasury **transfers** prize USDT to demo payer. No mint. |
| POST | `/api/ops/topup` | 0.05 WBT treasury → relayer. |
| POST | `/api/ops/drain` | Junk settle rejected **before** broadcast. |

## Contracts (1874)

| Name | Address |
| --- | --- |
| Prize USDT | `0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7` |
| GhostInvoiceRegistry | `0x7a11BF706e315F5f677Cd5c988b721e578494Cca` |
| GhostGateway | `0xf7Abc80Ff95113CE6386554bB1287D11b05A4052` |
| Relayer | `0x52e943E064FaBB1CE317936518F1C8dEc769a36c` |
| Treasury / backendSigner | `0x94dfC5579Cdb819112927650D2edB58DDAf4636d` |
| Demo payer / 880001 | `0x5690A6E8a3882C333f7E8451a3387a0C4a13d001` |
| 880002 | `0x63B2a5827e9e4539db09aE21E7A49ECf2DBA698E` |
| Merchant | `0xBF3578826CB053c29fd68BD2AD599401BCc14741` |

`GhostGateway.settle` requires Open invoice, exact amount, `payerAllowed[from]`, cap 100 USDT. Gateway holds no USDT. Relayer holds WBT only.
