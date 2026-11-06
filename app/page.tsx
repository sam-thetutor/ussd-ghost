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
            src="/hero-nokia-native.png"
            alt="Nokia 3310 whose LCD shows USend, 1 Send money, 2 Receive money, 0 Exit"
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

      <section
        id="how-it-works"
        className="flex-1 bg-[#F4EBD8] text-[#1A140C]"
      >
        <div className="h-2 bg-[#3C2A1E]" aria-hidden />
        <div className="px-6 py-14 sm:px-10 lg:px-14 lg:py-16">
          <p
            className={`${plexMono.className} text-[11px] font-medium uppercase tracking-[0.22em] text-[#B42318]`}
          >
            How it works
          </p>
          <h2 className="mt-3 max-w-[18ch] text-3xl font-extrabold tracking-tight sm:text-4xl">
            Activate. Send to a code. Relayer pays gas.
          </h2>
          <p className="mt-3 max-w-xl text-base leading-6 text-[#3C2A1E]">
            Each phone gets a numeric code and a hidden wallet. Dial USSD to
            send prize USDT. USend&apos;s relayer pays WBT.
          </p>

          <ol className="mt-12 grid gap-0 border-y border-[#3C2A1E] lg:grid-cols-3">
            <li className="flex flex-col gap-4 border-[#3C2A1E] py-8 lg:border-r lg:pr-10 lg:py-10">
              <p
                className={`${plexMono.className} text-[11px] font-medium uppercase tracking-[0.22em] text-[#B42318]`}
              >
                1. Activate
              </p>
              <h3 className="text-2xl font-extrabold tracking-tight">
                Dial 2. Get your code.
              </h3>
              <p className="text-sm leading-6 text-[#3C2A1E] sm:text-base">
                USSD maps the phone to a custodied address. You see a numeric
                code and a balance. No seed. No app.
              </p>
            </li>

            <li className="flex flex-col gap-4 border-t border-[#3C2A1E] py-8 lg:border-t-0 lg:border-r lg:px-10 lg:py-10">
              <p
                className={`${plexMono.className} text-[11px] font-medium uppercase tracking-[0.22em] text-[#B42318]`}
              >
                2. Send
              </p>
              <h3 className="text-2xl font-extrabold tracking-tight">
                Enter their code, amount, PIN.
              </h3>
              <p className="text-sm leading-6 text-[#3C2A1E] sm:text-base">
                Dial {AT_DIAL}. Pay to a code, not a till invoice. Hang up and
                the session dies — shared-phone property, not a bug.
              </p>
              <a
                href={AT_SIMULATOR}
                className="mt-auto inline-flex w-fit min-h-12 items-center justify-center rounded-full bg-[#B42318] px-6 py-3 text-base font-semibold text-[#F4EBD8]"
              >
                Dial {AT_DIAL}
              </a>
            </li>

            <li className="flex flex-col gap-4 border-t border-[#3C2A1E] py-8 lg:border-t-0 lg:pl-10 lg:py-10">
              <p
                className={`${plexMono.className} text-[11px] font-medium uppercase tracking-[0.22em] text-[#B42318]`}
              >
                3. Relayer
              </p>
              <h3 className="text-2xl font-extrabold tracking-tight">
                USend pays the gas.
              </h3>
              <p className="text-sm leading-6 text-[#3C2A1E] sm:text-base">
                Backend opens a 15-minute invoice to their address, then
                GhostGateway.settle. Relayer spends WBT. Payer WBT stays zero.
              </p>
              <Link
                href="/ops"
                className={`${plexMono.className} mt-auto text-sm underline underline-offset-4`}
              >
                Operator
              </Link>
            </li>
          </ol>

          <p
            className={`${plexMono.className} mt-10 max-w-2xl text-xs leading-5 text-[#3C2A1E]`}
          >
            Africa&apos;s Talking sandbox is not a live MNO. The Whitechain
            payment is real. Dial {AT_DIAL} at the simulator.
          </p>
        </div>
      </section>

      <footer
        className={`${plexMono.className} flex gap-6 bg-[#F4EBD8] px-6 py-6 text-xs text-[#3C2A1E] sm:px-10 lg:px-14`}
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
