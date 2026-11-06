# USend

Sending stablecoins using USSD codes.

![A Nokia 3310 on a till counter. Its screen reads USend.](docs/product/handset.jpg)

Dial `*384*71618#`. Activate the phone. Send prize USDT to someone else’s numeric code. No app, no seed phrase, and no gas on the phone. USend pays the gas.

The money is prize USDT on Whitechain. This version is dialed in the Africa’s Talking sandbox, not on Safaricom or Airtel.

[Open USend](https://minds-birds-airport-dozens.trycloudflare.com) · [Dial *384*71618#](https://simulator.africastalking.com:1517/)

## The session

The handset photograph is a product still. Its screen is not the live menu. After you dial, the session is:

```
USend
1. Send
2. Activate
3. Balance
0. Exit
```

| You press | What you get |
| --- | --- |
| `2` | A numeric code for this phone, and the prize USDT balance. |
| `1` | Their code, then the amount, then your PIN. Success reads `Confirmed. {amount} sent to {code}.` |
| `3` | Your code and balance. If this phone is new: `Dial 2 to activate.` |
| `0` | `Thank you.` The session ends. Hanging up does the same. |

Before the PIN, the screen says `Fee: 0. No extra charge.`

An unknown code, a bad amount, a short balance, or a wrong PIN ends with `You were not charged.` Three wrong PINs lock that session.

![Backup keypad on USend, showing Dial *384*71618# for +254700000001.](docs/product/keypad.jpg)

That keypad is the backup on the site, at `/phone`. The dial to use is the [Africa’s Talking simulator](https://simulator.africastalking.com:1517/).

## Two phones you can use now

| Phone | Code |
| --- | --- |
| `+254700000001` | `880001` |
| `+254700000002` | `880002` |

PIN `2580`. It is not printed on the handset.

Register `+254700000001` in the simulator, launch USSD, and type `*384*71618#`. `*384#` alone does not open USend.

To send: press `2` on `880001` if it is not already active, then `1` → `880002` → an amount → `2580`. On the other phone, press `3` to see the balance.

A new phone number gets its own code the first time it presses `2`.

## The money

Prize USDT on Whitechain Sepolia. One send is at most 100. The payment stays open for 15 minutes. USend’s relayer pays the network fee, so the phone’s balance is only the stablecoin.

This is not a cash-out. There is no refund in this version. Paying the other token, USDT.e, does not count.

## A shared phone

Hang up, or close the keypad, and the session is gone. The next person does not continue your PIN entry.

Operator routes and the Africa’s Talking callback are in [docs/API.md](docs/API.md).
