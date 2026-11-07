# USend

A USDT wallet you dial.

The phone number is the account. No app, no internet on the handset, no smartphone. A feature phone is enough.

Dial `*384*71618#` in the Africa’s Talking sandbox. This is not Safaricom or Airtel. Settlement is prize USDT on Whitechain Sepolia. USend pays the gas.

## The gap

People in Sub-Saharan Africa already move money by dialing a shortcode. A chain address does not fit that session. It is too long to type on a feature phone, and the phone would still need a data connection and a gas token.

In 2024, 42% of adults in Sub-Saharan Africa had no account at a bank or a mobile-money service. Account ownership was 58%. About 300 million adults, 40%, already have a mobile-money account. On a feature phone that account is reached by USSD. About 80 million adults without an account already have a phone, an identity document, and a SIM in their own name.

Sources: World Bank, Global Findex 2025, survey year 2024. These figures are Sub-Saharan Africa.

## The product

USend is that shortcode, with the balance in USDT.

1. A new number dials and sets a 4-digit PIN. That opens the wallet. Until then, the number cannot be paid.
2. Receive shows the number people should pay, and a short code if the number stays private.
3. Send takes the other person’s phone number, an amount, and the PIN. A 6-digit code still works.
4. USend holds the keys and submits the payment. The relayer spends WBT. The phone’s WBT balance stays at zero.

The address is not computed from the digits of the phone. The phone is written into a directory when the PIN is confirmed. The key is derived from that registration index.

Fee: 0. One send is at most 100 prize USDT and stays open for 15 minutes. There is no cash-out in this version. USDT.e is not the token.

## Why it can cross a border

A mobile-money transfer pays the local currency of one country. A USend number pays the same prize USDT on both sides. Country A shares a phone number. Country B dials it. The amount that arrives is USDT.

What is live today is one sandbox shortcode and prize USDT on Whitechain Sepolia. A second live mobile network is the next step.

## Demo

| Phone | Code | PIN |
| --- | --- | --- |
| `+254700000001` | `880001` | `2580` |
| `+254700000002` | `880002` | `2580` |

From the first phone: `1` → `254700000002` → an amount → `2580`.

Simulator: https://simulator.africastalking.com:1517/  
Site: https://isp-womens-clan-floppy.trycloudflare.com
