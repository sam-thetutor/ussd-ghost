"use client";

import { useState } from "react";
import Link from "next/link";

type Status = {
  relayerJob: string;
  balances: {
    treasuryWbt: string;
    relayerWbt: string;
    payerWbt: string;
    relayerUsdt: string;
    payerUsdt: string;
    merchantUsdt: string;
    treasuryUsdt: string;
  };
  faucet: { url: string; drip: string; note: string; lastClaim: string | null };
  allowlist: { label: string; address: string; note: string }[];
  rejects: { at: string; reason: string; detail: string }[];
  addresses: {
    treasury: string;
    relayer: string;
    payer: string;
    merchant: string;
    explorerTreasury: string;
    explorerRelayer: string;
  };
  demoPinHint: string;
  error?: string;
};

export function OpsShell() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [flash, setFlash] = useState("");

  async function authed(path: string, init?: RequestInit) {
    const res = await fetch(path, {
      ...init,
      headers: {
        "x-ops-password": password,
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
    return { res, json: await res.json() };
  }

  async function load() {
    const { res, json } = await authed("/api/ops/status");
    if (!res.ok) {
      setFlash(json.error || "unauthorized");
      setStatus(null);
      return;
    }
    setStatus(json);
    setFlash("");
  }

  async function topup() {
    const { res, json } = await authed("/api/ops/topup", { method: "POST" });
    setFlash(res.ok ? `Top-up ${json.explorer}` : json.error);
    await load();
  }

  async function drain() {
    const { json } = await authed("/api/ops/drain", { method: "POST" });
    setFlash(
      json.result?.ok
        ? "unexpected send"
        : `Drain rejected: ${json.result?.reason}. No tx sent.`,
    );
    await load();
  }

  async function cashin() {
    const { res, json } = await authed("/api/ops/cashin", {
      method: "POST",
      body: JSON.stringify({ amount: "20" }),
    });
    setFlash(res.ok ? `Cash-in ${json.explorer}` : json.error);
    await load();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 font-mono">
      <header>
        <p className="text-xs uppercase tracking-widest text-[#e2b04a]">Operator console</p>
        <h1 className="font-sans text-2xl font-semibold">USend /ops</h1>
        <p className="text-xs text-[#f5d76e]">USSD simulator — not a live MNO session.</p>
      </header>

      <div className="flex gap-2">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="OPS_PASSWORD"
          className="flex-1 rounded border border-[#3d3428] bg-black px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => void load()}
          className="rounded bg-[#e2b04a] px-4 py-2 text-sm text-black"
        >
          Unlock
        </button>
      </div>
      {flash ? <p className="text-sm text-[#f5d76e]">{flash}</p> : null}

      {status ? (
        <>
          <section className="rounded-xl border border-[#3d3428] bg-[#111] p-4 text-sm">
            <h2 className="text-[#e2b04a]">WBT path</h2>
            <p>Treasury WBT: {status.balances.treasuryWbt}</p>
            <p>Relayer WBT: {status.balances.relayerWbt}</p>
            <p>Payer WBT: {status.balances.payerWbt} (must stay 0)</p>
            <p>Relayer USDT: {status.balances.relayerUsdt} (must stay 0)</p>
            <p>Payer USDT: {status.balances.payerUsdt}</p>
            <p>Merchant USDT: {status.balances.merchantUsdt}</p>
            <p className="mt-2 text-xs text-[#b9aa8e]">
              Faucet {status.faucet.drip} → treasury. Last claim:{" "}
              {status.faucet.lastClaim || "none yet — Samuel must GitHub-login the faucet."}
            </p>
            <a className="text-xs text-[#e2b04a] underline" href={status.faucet.url}>
              faucet.testnet.whitechain.io
            </a>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => void topup()} className="rounded bg-[#3d8f4a] px-3 py-1 text-white">
                Top up relayer (0.05 WBT)
              </button>
              <button type="button" onClick={() => void cashin()} className="rounded bg-[#3d5a8f] px-3 py-1 text-white">
                Demo cash-in 20 USDT
              </button>
              <button type="button" onClick={() => void drain()} className="rounded bg-[#8f3d3d] px-3 py-1 text-white">
                Drain drill
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#b9aa8e]">{status.relayerJob}</p>
            <p className="mt-2 text-xs text-[#b9aa8e]">
              Demo PIN (not shown on /phone): {status.demoPinHint}. Cash-in is an operator
              credit, not a licensed CICO network, not a faucet.
            </p>
          </section>

          <section className="rounded-xl border border-[#3d3428] bg-[#111] p-4 text-sm">
            <h2 className="text-[#e2b04a]">Allowlist</h2>
            <ul className="mt-2 space-y-2 text-xs">
              {status.allowlist.map((row) => (
                <li key={row.label}>
                  <span className="text-[#f5d76e]">{row.label}</span> {row.address}
                  <div className="text-[#b9aa8e]">{row.note}</div>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-[#b9aa8e]">
              Relayer may not transfer WBT except the documented treasury top-up / sweep.
            </p>
          </section>

          <section className="rounded-xl border border-[#3d3428] bg-[#111] p-4 text-sm">
            <h2 className="text-[#e2b04a]">Reject log</h2>
            <ul className="mt-2 space-y-2 text-xs">
              {status.rejects.length === 0 ? (
                <li className="text-[#b9aa8e]">No rejects yet. Run the drain drill.</li>
              ) : (
                status.rejects.map((row, i) => (
                  <li key={`${row.at}-${i}`}>
                    {row.at} · {row.reason} · {row.detail}
                  </li>
                ))
              )}
            </ul>
          </section>
        </>
      ) : null}

      <Link href="/" className="text-center text-xs text-[#b9aa8e] underline">
        Back
      </Link>
    </div>
  );
}
