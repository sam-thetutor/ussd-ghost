import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-12">
      <header className="space-y-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#e2b04a]">
          ETHGlobal Mumbai · Whitechain Scale
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">USSD Ghost</h1>
        <p className="max-w-xl text-lg leading-8 text-[#d7c9a8]">
          A kiosk till the payer approves on a phone-number / USSD-like screen.
          They never open a crypto app, never hold WBT, never see a seed or a
          chain. A relayer pays gas. Settlement is prize USDT on Whitechain
          Sepolia.
        </p>
        <p className="rounded-md border border-yellow-700/40 bg-black/40 px-4 py-3 font-mono text-sm text-[#f5d76e]">
          USSD simulator — not a live MNO session. The telco hop is fake; the
          Whitechain payment is not.
        </p>
      </header>
      <nav className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/phone"
          className="rounded-xl border border-[#3d3428] bg-[#1c1813] p-5 transition hover:border-[#e2b04a]"
        >
          <h2 className="text-lg font-medium">/phone</h2>
          <p className="mt-2 text-sm text-[#b9aa8e]">
            Payer. Dial *384*71#. No wallet connect.
          </p>
        </Link>
        <Link
          href="/till"
          className="rounded-xl border border-[#3d3428] bg-[#1c1813] p-5 transition hover:border-[#e2b04a]"
        >
          <h2 className="text-lg font-medium">/till</h2>
          <p className="mt-2 text-sm text-[#b9aa8e]">
            Mama Amina Kiosk. Invoice and explorer receipt.
          </p>
        </Link>
        <Link
          href="/ops"
          className="rounded-xl border border-[#3d3428] bg-[#1c1813] p-5 transition hover:border-[#e2b04a]"
        >
          <h2 className="text-lg font-medium">/ops</h2>
          <p className="mt-2 text-sm text-[#b9aa8e]">
            Gas wallet, faucet top-up, allowlist, drain drill.
          </p>
        </Link>
      </nav>
    </main>
  );
}
