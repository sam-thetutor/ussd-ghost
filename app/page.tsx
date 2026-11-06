import Image from "next/image";
import Link from "next/link";
import { Figtree, IBM_Plex_Mono } from "next/font/google";

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
      className={`${figtree.className} flex flex-1 flex-col bg-[#1A140C] text-[#F4EBD8]`}
    >
      <section className="grid min-h-[min(70vh,38rem)] grid-cols-1 lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)]">
        <div className="flex flex-col justify-center gap-5 px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <p className="text-sm font-extrabold tracking-[0.28em] text-[#F4EBD8]">
            USend
          </p>
          <p
            className={`${plexMono.className} text-[11px] font-medium uppercase tracking-[0.22em] text-[#F4EBD8]`}
          >
            Powered by Whitechain
          </p>
          <h1 className="max-w-[18ch] text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Sending stablecoins using USSD codes.
          </h1>
          <p className="text-lg leading-7 text-[#F4EBD8] sm:text-xl">
            Send and receive on a feature phone. No smartphone. No internet.
          </p>
          <p className="max-w-md text-sm leading-6 text-[#C4A574] sm:text-base">
            Dial a shortcode. Send to a till or receive from one. A relayer pays
            gas; settlement is prize USDT on Whitechain. The customer never
            opens a crypto app.
          </p>
          <a
            href={AT_SIMULATOR}
            className="inline-flex w-fit min-h-12 items-center justify-center rounded-full bg-[#B42318] px-6 py-3 text-base font-semibold text-[#F4EBD8] sm:text-lg"
          >
            Dial {AT_DIAL}
          </a>
          <p className={`${plexMono.className} text-xs leading-5 text-[#C4A574]`}>
            Africa&apos;s Talking sandbox — not a live MNO.
          </p>
        </div>

        <div className="relative min-h-[22rem] lg:min-h-full">
          <Image
            src="/hero-nokia.png"
            alt="Worn Nokia feature phone showing a USSD menu: 1 Send money, 2 Receive money"
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover object-[center_20%] lg:object-center"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[#1A140C] to-transparent lg:block"
          />
        </div>
      </section>

      <section className="border-t border-[#3C2A1E] px-6 py-14 sm:px-10 lg:px-14 lg:py-16">
        <ol className="grid gap-12 lg:grid-cols-3 lg:gap-10">
          <li className="space-y-3">
            <p
              className={`${plexMono.className} text-[11px] font-medium uppercase tracking-[0.22em] text-[#B42318]`}
            >
              01
            </p>
            <h2 className="text-2xl font-extrabold leading-snug tracking-tight text-white">
              Most payers use a feature phone.
            </h2>
            <p className="text-sm leading-6 text-[#C4A574] sm:text-base">
              No smartphone. No data. A shared handset. They already know USSD.
            </p>
          </li>
          <li className="space-y-3">
            <p
              className={`${plexMono.className} text-[11px] font-medium uppercase tracking-[0.22em] text-[#B42318]`}
            >
              02
            </p>
            <h2 className="text-2xl font-extrabold leading-snug tracking-tight text-white">
              A crypto wallet asks for a seed. A telco rail can reverse.
            </h2>
            <p className="text-sm leading-6 text-[#C4A574] sm:text-base">
              A wallet wants a seed. A telco rail can send it back. Neither is
              this payment.
            </p>
          </li>
          <li className="space-y-3">
            <p
              className={`${plexMono.className} text-[11px] font-medium uppercase tracking-[0.22em] text-[#B42318]`}
            >
              03
            </p>
            <h2 className="text-2xl font-extrabold leading-snug tracking-tight text-white">
              Dial USSD. A relayer pays gas. Prize USDT on Whitechain.
            </h2>
            <p className="text-sm leading-6 text-[#C4A574] sm:text-base">
              Never a crypto app.
            </p>
          </li>
        </ol>
        <p
          className={`${plexMono.className} mt-12 max-w-2xl text-xs leading-5 text-[#C4A574]`}
        >
          Africa&apos;s Talking sandbox is not a live MNO. The Whitechain
          payment is real.
        </p>
      </section>

      <footer
        className={`${plexMono.className} flex gap-6 px-6 py-6 text-xs text-[#C4A574] sm:px-10 lg:px-14`}
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
