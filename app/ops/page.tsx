export default function OpsPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-semibold">Operator</h1>
      <p className="font-mono text-sm text-[#f5d76e]">
        USSD simulator — not a live MNO session.
      </p>
      <p className="text-[#b9aa8e]">
        Treasury → relayer WBT, allowlist, drain drill, demo cash-in. Relayer
        holds WBT only. Never holds USDT.
      </p>
    </main>
  );
}
