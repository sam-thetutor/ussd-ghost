import Link from "next/link";
import { PhoneShell } from "@/components/PhoneShell";

export default function PhonePage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-6 bg-[#14110d] px-4 py-8 text-[#f4ead5]">
      <p className="max-w-sm text-center font-mono text-xs text-[#b9aa8e]">
        Backup web simulator. Primary payer path is Africa&apos;s Talking sandbox
        at simulator.africastalking.com:1517 — still not a live MNO session.
      </p>
      <PhoneShell />
      <Link href="/" className="text-xs text-[#b9aa8e] underline">
        Put the handset down
      </Link>
    </main>
  );
}
