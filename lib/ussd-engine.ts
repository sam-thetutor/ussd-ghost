import { parseUnits } from "viem";
import { formatUsdt } from "./format";
import { DEMO_PHONE, DEMO_TILL, demoPinHash } from "./demo-state";
import { findByCode, findByPhone } from "./p2p-directory";
import { activatePhone, formatPrizeBalance, payToCode } from "./p2p";
import { verifyPin } from "./pin";

type Session = { pinTries: number; locked: boolean };
const sessions = new Map<string, Session>();

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
  const phone = input.phoneNumber;

  if (sess.locked) {
    return end("PIN locked this session. You were not charged.");
  }

  if (parts.length === 0) {
    return con(`USend\n1. Send\n2. Activate\n3. Balance\n0. Exit`);
  }

  const choice = parts[0];
  if (choice === "0") {
    clearUssdSession(input.sessionId);
    return end("Thank you.");
  }

  if (choice === "2") {
    const { user, balance } = await activatePhone(phone);
    return end(`Activated. Code ${user.code}\nBal ${balance}`);
  }

  if (choice === "3") {
    const user = findByPhone(phone);
    if (!user) {
      return end("Dial 2 to activate.");
    }
    const balance = await formatPrizeBalance(user.address);
    return end(`Code ${user.code}\nBal ${balance}`);
  }

  if (choice !== "1") {
    return end("Invalid choice.");
  }

  const sender = findByPhone(phone);
  if (!sender) {
    return end("Dial 2 to activate. You were not charged.");
  }

  if (parts.length === 1) {
    return con("Enter their code");
  }

  const code = (parts[1] ?? "").trim();
  const payee = findByCode(code);
  if (!payee) {
    return end("Unknown code. You were not charged.");
  }
  if (payee.phone === sender.phone) {
    return end("That is your code. You were not charged.");
  }

  if (parts.length === 2) {
    return con(`Code ${payee.code}\nEnter amount`);
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
      `Pay ${formatUsdt(amount)} to ${payee.code}\nFee: 0. No extra charge.\nEnter PIN`,
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

  const result = await payToCode({
    fromPhone: phone,
    code: payee.code,
    amount,
  });

  if (!result.ok) {
    if (result.reason === "insufficient_usdt") {
      return end("Not enough balance. You were not charged.");
    }
    if (result.reason === "unknown_code") {
      return end("Unknown code. You were not charged.");
    }
    if (result.reason === "relayer_wbt_low") {
      return end("Try again. You were not charged.");
    }
    if (result.reason === "expired") {
      return end("Request expired. You were not charged.");
    }
    return end("Try again. You were not charged.");
  }

  clearUssdSession(input.sessionId);
  return end(
    `Confirmed. ${formatUsdt(amount)} sent to ${payee.code}. Ref ${result.ref}`,
  );
}

export const demoDialHint = `${DEMO_TILL}`;
export { DEMO_TILL, DEMO_PHONE };
