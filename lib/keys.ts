import { type Hex, isHex } from "viem";

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}

export function optionalEnv(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export function privateKey(name: string): Hex {
  let value = requiredEnv(name).trim();
  if (!value.startsWith("0x")) value = `0x${value}`;
  if (!isHex(value) || value.length !== 66) {
    throw new Error(`Invalid private key in ${name}`);
  }
  return value;
}
