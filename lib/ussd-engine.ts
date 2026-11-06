import { parseUnits } from "viem";
import { formatUsdt } from "./format";
import { usdtAbi } from "./abi";
import { PRIZE_USDT } from "./addresses";
import { getPublicClient } from "./chain";
import {
  DEMO_PHONE,
  DEMO_TILL,
  TILL_NAME,
  demoPinHash,
  demoPayerAddress,
  isDemoPhone,
  tillLookup,
} from "./demo-state";
import { findOpenInvoice } from "./invoices";
import { verifyPin } from "./pin";
import { settleInvoice } from "./relayer";

type Session = { pinTries: number; locked: boolean };
const sessions = new Map<string, Session>();
const statements: { at: string; amount: string; ref: string; till: string }[] = [];

function sessionOf(id: string): Session {
  const existing = sessions.get(id);
  if (existing) return existing;
  const created = { pinTries: 0, locked: false };
  sessions.set(id, created);
  return created;
}

function con(body: string): string {
  return `CON ${body}`;
}

function end(body: string): string {
  return `END ${body}`;
}

export function clearUssdSession(sessionId: string) {
  sessions.delete(sessionId);
}

export async function handleUssd(input: {
  sessionId: string;
  phoneNumber: string;
  serviceCode: string;
  text: string;
}): Promise<string> {
  const parts = input.text === "" ? [] : input.text.split("*");
  const sess = sessionOf(input.sessionId);

  if (!isDemoPhone(input.phoneNumber) && input.phoneNumber !== DEMO_PHONE) {
    // Weekend: one demo MSISDN. Unknown numbers still get the menu so AT sandbox can play,
    // but PIN will only debit the custodied demo payer.
  }

  if (sess.locked) {
    return end("PIN locked this session. You were not charged.");
  }

  if (parts.length === 0) {
    return con(
      `USSD Ghost\n1. Pay merchant\n2. Balance\n3. Mini statement\n0. Exit`,
    );
  }

  const choice = parts[0];
  if (choice === "0") {
    clearUssdSession(input.sessionId);
    return end("Thank you.");
  }

  if (choice === "2") {
    const client = getPublicClient();
    const bal = await client.readContract({
      address: PRIZE_USDT,
      abi: usdtAbi,
      functionName: "balanceOf",
      args: [demoPayerAddress()],
    });
    return end(`Bal ${formatUsdt(bal)}`);
  }

  if (choice === "3") {
    if (statements.length === 0) {
      return end("No recent payments.");
    }
    const lines = statements.slice(0, 3).map((s) => `${s.at} ${s.amount} ${s.till} ${s.ref}`);
    return end(lines.join("\n"));
  }

  if (choice !== "1") {
    return end("Invalid choice.");
  }

  if (parts.length === 1) {
    return con("Enter till number");
  }

  const till = parts[1] ?? "";
  const shop = tillLookup(till);
  if (!shop) {
    return end("Unknown till. You were not charged.");
  }

  if (parts.length === 2) {
    return con(`${shop.name}\nEnter amount`);
  }

  let amount: bigint;
  try {
    amount = parseUnits(parts[2] ?? "", 6);
  } catch {
    return end("Bad amount. You were not charged.");
  }
  if (amount <= BigInt(0)) {
    return end("Bad amount. You were not charged.");
  }

  if (parts.length === 3) {
    return con(
      `Pay ${formatUsdt(amount)} to ${shop.name}\nFee: 0. No extra charge.\nEnter PIN`,
    );
  }

  const pin = parts[3] ?? "";
  if (!verifyPin(pin, demoPinHash())) {
    sess.pinTries += 1;
    const left = 3 - sess.pinTries;
    if (left <= 0) {
      sess.locked = true;
      return end("PIN locked this session. You were not charged.");
    }
    return con(`Wrong PIN. ${left} tries left`);
  }

  const invoice = await findOpenInvoice(shop.payee, amount);
  if (!invoice) {
    return end("No open request for that till and amount. You were not charged.");
  }

  const result = await settleInvoice({
    invoiceId: invoice.invoiceId,
    from: demoPayerAddress(),
    to: shop.payee,
    value: amount,
  });

  if (!result.ok) {
    if (result.reason === "relayer_wbt_low") {
      return end("Try again. You were not charged.");
    }
    if (result.reason === "insufficient_usdt") {
      return end("Not enough balance. You were not charged.");
    }
    if (result.reason === "expired") {
      return end("Request expired. You were not charged.");
    }
    return end("Try again. You were not charged.");
  }

  const stamp = new Date().toISOString().slice(5, 10).replace("-", "");
  statements.unshift({
    at: stamp,
    amount: formatUsdt(amount),
    ref: result.ref,
    till: TILL_NAME,
  });
  clearUssdSession(input.sessionId);
  return end(
    `Confirmed. ${formatUsdt(amount)} paid to ${TILL_NAME}. Ref ${result.ref}`,
  );
}

export const demoDialHint = `${DEMO_TILL}`;
export { DEMO_TILL, DEMO_PHONE };
