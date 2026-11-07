import { parseUnits } from "viem";
import { formatUsdt } from "./format";
import { DEMO_PHONE, DEMO_TILL, demoPinHash } from "./demo-state";
import { findByPhone, resolvePayee } from "./p2p-directory";
import { activatePhone, formatPrizeBalance, payToUser } from "./p2p";
import { hashPin, verifyPin } from "./pin";

const MENU = "USend\n1. Send\n2. Receive\n3. Balance\n0. Exit";

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

  const sender = findByPhone(phone);
  if (!sender) {
    return firstDial(phone, parts);
  }

  if (sess.locked) {
    return end("PIN locked this session. You were not charged.");
  }

  if (parts.length === 0) {
    return con(MENU);
  }

  const choice = parts[0];
  if (choice === "0") {
    clearUssdSession(input.sessionId);
    return end("Thank you.");
  }

  if (choice === "2") {
    return end(`People pay this number\n${sender.phone}\nCode ${sender.code}`);
  }

  if (choice === "3") {
    const balance = await formatPrizeBalance(sender.address);
    return end(`Code ${sender.code}\nBal ${balance}`);
  }

  if (choice !== "1") {
    return end("Invalid choice.");
  }

  if (parts.length === 1) {
    return con("Enter their number");
  }

  const payee = resolvePayee((parts[1] ?? "").trim());
  if (!payee) {
    return end("Unknown number. You were not charged.");
  }
  if (payee.phone === sender.phone) {
    return end("That is your number. You were not charged.");
  }

  if (parts.length === 2) {
    return con(`Pay ${payee.phone}\nEnter amount`);
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
      `Pay ${formatUsdt(amount)} to ${payee.phone}\nFee: 0. No extra charge.\nEnter PIN`,
    );
  }

  const pin = parts[3] ?? "";
  const stored = sender.pinHash || demoPinHash();
  if (!verifyPin(pin, stored)) {
    sess.pinTries += 1;
    const left = 3 - sess.pinTries;
    if (left <= 0) {
      sess.locked = true;
      return end("PIN locked this session. You were not charged.");
    }
    return con(`Wrong PIN. ${left} tries left`);
  }

  const result = await payToUser({
    fromPhone: phone,
    payee,
    amount,
  });

  if (!result.ok) {
    if (result.reason === "insufficient_usdt") {
      return end("Not enough balance. You were not charged.");
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
    `Confirmed. ${formatUsdt(amount)} sent to ${payee.phone}. Ref ${result.ref}`,
  );
}

function firstDial(phone: string, parts: string[]): Promise<string> | string {
  if (parts.length === 0) return con("Create a 4-digit PIN");
  if (!/^\d{4}$/.test(parts[0] ?? "")) {
    return end("PIN must be 4 digits. Dial again.");
  }
  if (parts.length === 1) return con("Confirm PIN");
  if (parts.length !== 2 || parts[0] !== parts[1]) {
    return end("PINs did not match. Dial again.");
  }
  return openWallet(phone, parts[0]);
}

async function openWallet(phone: string, pin: string): Promise<string> {
  const { user, balance } = await activatePhone(phone, hashPin(pin));
  return end(`Wallet open.\nPay ${user.phone}\nCode ${user.code}\nBal ${balance}`);
}

export const demoDialHint = `${DEMO_TILL}`;
export { DEMO_TILL, DEMO_PHONE };
