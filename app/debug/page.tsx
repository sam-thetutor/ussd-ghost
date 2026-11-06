"use client";

import { useState } from "react";

export default function DebugPage() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState<string>("");

  async function load() {
    const res = await fetch("/api/ops/status", {
      headers: { "x-ops-password": password },
    });
    setData(JSON.stringify(await res.json(), null, 2));
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-10">
      <h1 className="text-xl font-semibold">Debug (off video)</h1>
      <p className="font-mono text-sm text-[#f5d76e]">
        USSD simulator — not a live MNO session.
      </p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="debug / ops password"
        className="rounded border border-[#3d3428] bg-black px-3 py-2 font-mono"
      />
      <button
        type="button"
        onClick={load}
        className="w-fit rounded bg-[#e2b04a] px-4 py-2 text-black"
      >
        Load mapping
      </button>
      <pre className="overflow-auto rounded bg-black/60 p-4 text-xs">{data}</pre>
    </main>
  );
}
