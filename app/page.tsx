import Link from "next/link";
import { Archivo_Black, Figtree, Fraunces, IBM_Plex_Mono } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
});

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

const AT_SIMULATOR = "https://simulator.africastalking.com:1517/";
const AT_DIAL = "*384*71618#";

export default function Home() {
  return (
    <main
      className={`${figtree.className} flex flex-1 flex-col bg-[#F4EBD8] text-[#1A140C]`}
    >
      <section className="mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 items-start gap-10 px-6 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <div className="space-y-6">
          <p
            className={`${plexMono.className} text-[11px] font-medium uppercase tracking-[0.22em] text-[#3C2A1E]`}
          >
            Open till
          </p>
          <h1
            className={`${fraunces.className} text-4xl leading-tight tracking-tight text-[#1A140C] sm:text-5xl`}
          >
            Mama Amina Kiosk
          </h1>
          <p
            className={`${archivoBlack.className} text-5xl leading-none tracking-tight text-[#B42318] sm:text-7xl`}
          >
            123456
          </p>
          <p className={`${plexMono.className} text-sm text-[#3C2A1E]`}>Till number</p>
          <div className="max-w-md space-y-3 border-t border-[#C4A574] pt-6">
            <p
              className={`${plexMono.className} text-[11px] font-medium uppercase tracking-[0.22em] text-[#B42318]`}
            >
              Problem
            </p>
            <p className="text-lg leading-8 text-[#1A140C]">
              Kiosk pay still runs on USSD. Households share phones. An app
              assumes a personal handset and a crypto wallet. The payer should
              never open a crypto app, hold WBT, or see a seed.
            </p>
          </div>
        </div>

        <div className="space-y-6 rounded-sm border-2 border-[#3C2A1E] bg-[#F7F1E3] p-6 shadow-[4px_4px_0_#3C2A1E] sm:p-8">
          <div className="space-y-3">
            <p
              className={`${plexMono.className} text-[11px] font-medium uppercase tracking-[0.22em] text-[#B42318]`}
            >
              Solution
            </p>
            <h2
              className={`${fraunces.className} text-2xl leading-snug sm:text-3xl`}
            >
              Dial USSD. A relayer pays gas. The kiosk gets prize USDT.
            </h2>
            <p className="text-base leading-7 text-[#3C2A1E]">
              Africa&apos;s Talking sandbox is the payer path — not a live MNO.
              PIN on the shortcode authorizes a one-time pull. Settlement is
              prize USDT on Whitechain Sepolia. The customer never sees the
              chain.
            </p>
          </div>
          <a
            href={AT_SIMULATOR}
            className={`${archivoBlack.className} flex min-h-14 w-full items-center justify-center rounded-sm bg-[#B42318] px-4 py-4 text-center text-xl tracking-wide text-[#F4EBD8] sm:text-3xl`}
          >
            Dial {AT_DIAL}
          </a>
          <p className={`${plexMono.className} text-xs leading-5 text-[#3C2A1E]`}>
            Primary payer: Africa&apos;s Talking sandbox. Register a number,
            then dial {AT_DIAL}. Simulator — not a live MNO session.
          </p>
        </div>
      </section>

      <footer
        className={`${plexMono.className} mx-auto flex w-full max-w-5xl gap-6 px-6 pb-10 text-xs text-[#3C2A1E]`}
      >
        <Link href="/till" className="underline underline-offset-4">
          Open till
        </Link>
        <Link href="/ops" className="underline underline-offset-4">
          Operator
        </Link>
      </footer>
    </main>
  );
}
