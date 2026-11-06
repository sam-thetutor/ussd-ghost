import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Address } from "viem";
import { demoPayerAddress, DEMO_PHONE, DEMO_TILL } from "./demo-state";

export const DEMO_P2P_CODE = process.env.DEMO_P2P_CODE || "880001";

export type P2pUser = {
  phone: string;
  code: string;
  index: number;
  address: Address;
  allowlisted: boolean;
};

type Store = {
  nextIndex: number;
  users: P2pUser[];
};

const FILE = join(process.cwd(), "data", "p2p-directory.json");

function emptyStore(): Store {
  return {
    nextIndex: 1,
    users: [
      {
        phone: normalizePhone(DEMO_PHONE),
        code: DEMO_P2P_CODE,
        index: 0,
        address: demoPayerAddress(),
        allowlisted: true,
      },
    ],
  };
}

function readStore(): Store {
  try {
    const raw = readFileSync(FILE, "utf8");
    const parsed = JSON.parse(raw) as Store;
    if (!Array.isArray(parsed.users)) return emptyStore();
    const demo = parsed.users.find((u) => u.index === 0);
    if (!demo) {
      parsed.users.unshift(emptyStore().users[0]);
    }
    if (!parsed.nextIndex || parsed.nextIndex < 1) parsed.nextIndex = 1;
    return parsed;
  } catch {
    return emptyStore();
  }
}

function writeStore(store: Store) {
  mkdirSync(dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  writeFileSync(tmp, JSON.stringify(store, null, 2));
  renameSync(tmp, FILE);
}

export function normalizePhone(raw: string): string {
  const trimmed = raw.replace(/[^\d+]/g, "");
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.startsWith("00")) return `+${trimmed.slice(2)}`;
  return `+${trimmed}`;
}

export function listP2pUsers(): P2pUser[] {
  return readStore().users;
}

export function findByPhone(phone: string): P2pUser | undefined {
  const n = normalizePhone(phone);
  return readStore().users.find(
    (u) => u.phone === n || u.phone === n.replace("+", "") || `+${u.phone.replace("+", "")}` === n,
  );
}

export function findByCode(code: string): P2pUser | undefined {
  const c = code.trim();
  return readStore().users.find((u) => u.code === c);
}

export function allocateUser(phone: string, address: Address, index: number): P2pUser {
  const store = readStore();
  const existing = store.users.find((u) => u.phone === normalizePhone(phone));
  if (existing) return existing;

  let code = String(880000 + index);
  while (code === DEMO_TILL || store.users.some((u) => u.code === code)) {
    store.nextIndex += 1;
    code = String(880000 + store.nextIndex);
  }
  const user: P2pUser = {
    phone: normalizePhone(phone),
    code,
    index,
    address,
    allowlisted: false,
  };
  store.users.push(user);
  store.nextIndex = Math.max(store.nextIndex, index + 1);
  writeStore(store);
  return user;
}

export function nextWalletIndex(): number {
  const store = readStore();
  return store.nextIndex;
}

export function markAllowlisted(address: Address) {
  const store = readStore();
  const user = store.users.find(
    (u) => u.address.toLowerCase() === address.toLowerCase(),
  );
  if (!user) return;
  user.allowlisted = true;
  writeStore(store);
}
