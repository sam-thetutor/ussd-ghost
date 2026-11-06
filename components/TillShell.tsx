"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Invoice = {
  invoiceId: string;
  amount: string;
  status: string;
  note: string;
  validBefore: number;
  explorerPay?: string;
  explorerOpen?: string;
  payTx?: string;
};

function formatAmount(raw: string): string {
  const n = BigInt(raw);
  const whole = n / BigInt(1_000_000);
  const frac = (n % BigInt(1_000_000)).toString().padStart(6, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole.toString();
}

export function TillShell() {
  const till = process.env.NEXT_PUBLIC_DEMO_TILL || "123456";
  const [amount, setAmount] = useState("5.00");
  const [note, setNote] = useState("");
  const [showPayee, setShowPayee] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const stored = JSON.parse(sessionStorage.getItem("ghost-invoices") || "[]") as string[];
    const rows: Invoice[] = [];
    for (const id of stored) {
      const res = await fetch(`/api/invoices?id=${id}`);
      const json = (await res.json()) as { invoice: Invoice | null };
      if (json.invoice) rows.push(json.invoice);
    }
    const list = await fetch("/api/invoices");
    const all = (await list.json()) as { invoices?: Invoice[] };
    const merged = new Map<string, Invoice>();
    for (const row of [...(all.invoices ?? []), ...rows]) merged.set(row.invoiceId, row);
    setInvoices([...merged.values()]);
  }, []);

  useEffect(() => {
    void refresh();
    const t = setInterval(() => void refresh(), 2500);
    return () => clearInterval(t);
  }, [refresh]);

  async function requestPay() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, note }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not open invoice");
        return;
      }
      const id = json.invoice?.invoiceId as string;
      if (id) {
        const stored = JSON.parse(sessionStorage.getItem("ghost-invoices") || "[]") as string[];
        sessionStorage.setItem("ghost-invoices", JSON.stringify([id, ...stored]));
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <header className="rounded-2xl border border-[#c9b48a] bg-[#f4ead5] p-5 text-[#2b2114]">
        <p className="font-mono text-xs uppercase tracking-widest text-[#8a5a1a]">Open till</p>
        <h1 className="text-2xl font-semibold">Mama Amina Kiosk</h1>
        <p className="font-mono text-lg">Till {till}</p>
        <button
          type="button"
          className="mt-2 text-xs underline"
          onClick={() => setShowPayee((s) => !s)}
        >
          {showPayee ? "Hide settlement address" : "Advanced: settlement address"}
        </button>
        {showPayee ? (
          <p className="mt-1 break-all font-mono text-[11px] text-[#5c4a32]">
            {process.env.NEXT_PUBLIC_MERCHANT_PAYEE || "set MERCHANT_PAYEE"}
          </p>
        ) : null}
      </header>

      <section className="rounded-2xl border border-[#3d3428] bg-[#1c1813] p-5">
        <h2 className="text-sm font-medium text-[#e2b04a]">Request pay</h2>
        <label className="mt-3 block text-xs text-[#b9aa8e]">Amount</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 w-full rounded border border-[#3d3428] bg-black px-3 py-2 font-mono"
        />
        <label className="mt-3 block text-xs text-[#b9aa8e]">Note (optional)</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 w-full rounded border border-[#3d3428] bg-black px-3 py-2"
        />
        <p className="mt-2 text-xs text-[#b9aa8e]">
          Payer types till {till} and this amount on /phone. Expires in 15 minutes.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => void requestPay()}
          className="mt-4 rounded bg-[#e2b04a] px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {busy ? "Opening…" : "Request pay"}
        </button>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      </section>

      <section className="rounded-2xl border border-[#3d3428] bg-[#1c1813] p-5">
        <h2 className="text-sm font-medium text-[#e2b04a]">Day list</h2>
        <ul className="mt-3 space-y-3">
          {invoices.length === 0 ? (
            <li className="text-sm text-[#b9aa8e]">No invoices yet.</li>
          ) : (
            invoices.map((inv) => (
              <li
                key={inv.invoiceId}
                className="rounded border border-[#3d3428] px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono">{formatAmount(inv.amount)}</span>
                  <span
                    className={
                      inv.status === "paid" ? "text-emerald-300" : "text-[#f5d76e]"
                    }
                  >
                    {inv.status === "paid" ? "Paid" : "Pending"}
                  </span>
                </div>
                {inv.note ? <p className="text-xs text-[#b9aa8e]">{inv.note}</p> : null}
                {inv.status === "paid" && inv.explorerPay ? (
                  <a
                    className="text-xs text-[#e2b04a] underline"
                    href={inv.explorerPay}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Receipt
                  </a>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>
      <Link href="/" className="text-center text-xs text-[#b9aa8e] underline">
        Back
      </Link>
    </div>
  );
}
