export default function PhonePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-6 px-6 py-10">
      <h1 className="text-2xl font-semibold">Payer phone</h1>
      <p className="text-center font-mono text-sm text-[#f5d76e]">
        USSD simulator — not a live MNO session.
      </p>
      <p className="text-center text-[#b9aa8e]">
        Dial *384*71# here. No seed, no chain, no wallet connect. Coming next:
        CON/END session.
      </p>
    </main>
  );
}
