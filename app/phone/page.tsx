import Link from "next/link";
import { PhoneShell } from "@/components/PhoneShell";

export default function PhonePage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-8">
      <PhoneShell />
      <Link href="/" className="text-xs text-[#b9aa8e] underline">
        Put the handset down
      </Link>
    </main>
  );
}
