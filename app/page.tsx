import type { ReactNode } from "react";
import Link from "next/link";
import { Figtree, IBM_Plex_Mono } from "next/font/google";
import { OpsShell } from "@/components/OpsShell";
import { PhoneShell } from "@/components/PhoneShell";

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
const FINDEX_PRESS =
  "https://www.worldbank.org/en/news/press-release/2025/07/16/mobile-phone-technology-powers-saving-surge-in-developing-economies";
const FINDEX_REPORT =
  "https://openknowledge.worldbank.org/entities/publication/8b9002b6-d8dd-426c-aa7c-6d7d16902cd7";
const dialClass =
  "inline-flex items-center justify-center rounded-md border-[1.5px] border-[#B17816] bg-[#EB9D2A] px-4 py-2.5 text-sm font-bold text-black";

const ghostClass =
  "inline-flex items-center justify-center rounded-md border-[1.5px] border-[#B17816] bg-white px-4 py-2.5 text-sm font-bold text-black";

export default function Home() {
  return (
    <main className={`${figtree.className} relative flex-1 text-[#23251D]`}>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="field absolute inset-0" />
        <div className="absolute -left-16 bottom-[-10%] h-[42%] w-[52%] rounded-[50%] bg-[#5a932c]" />
        <div className="absolute -right-20 bottom-[-14%] h-[38%] w-[46%] rounded-[50%] bg-[#3f7a22]" />
      </div>

      <header className="relative z-30 flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-5 text-sm font-semibold text-[#1c2a12]">
          <Link href="/" className="text-base font-extrabold tracking-tight">
            USend
          </Link>
          <a href="#why-ussd" className="hidden sm:inline">
            Why
          </a>
          <a href="#case" className="hidden sm:inline">
            Case
          </a>
          <a href="#how-it-works" className="hidden md:inline">
            How
          </a>
          <a href="#handset" className="hidden md:inline">
            Keypad
          </a>
          <a href="#ops" className="hidden lg:inline">
            Operator
          </a>
        </nav>
        <a href={AT_SIMULATOR} className={dialClass}>
          Dial {AT_DIAL}
        </a>
      </header>

      <Rail
        side="left"
        items={[
          { href: "/", label: "Home", icon: "home" },
          { href: AT_SIMULATOR, label: "Dial", icon: "phone", external: true },
          { href: "#handset", label: "Keypad", icon: "keypad" },
          { href: "#why-ussd", label: "Why", icon: "chart" },
        ]}
      />
      <Rail
        side="right"
        items={[
          { href: "#case", label: "Case", icon: "path" },
          { href: "#how-it-works", label: "How", icon: "list" },
          { href: "#ops", label: "Operator", icon: "sliders" },
        ]}
      />

      <div className="relative z-10 px-3 pt-2 pb-12 sm:px-5 lg:px-28 lg:pb-16">
        <article className="mx-auto max-w-5xl rounded-3xl bg-[#E6E7E1] px-5 py-7 shadow-[0_24px_60px_rgba(40,70,20,0.28)] sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          <div className="flex items-center gap-2">
            <Mark />
            <p className="text-lg font-extrabold tracking-tight">USend</p>
          </div>

          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)]">
            <div>
              <h1 className="max-w-[14ch] text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-[#111827] lg:text-[2.7rem]">
                A{" "}
                <span className="rounded-md bg-[#2F80FA]/15 px-1.5 text-[#2F80FA]">
                  USDT
                </span>{" "}
                wallet you dial.
              </h1>
              <p className="mt-5 max-w-md text-xl font-semibold leading-snug tracking-tight text-[#111827]">
                No internet. No smartphone. A feature phone is enough.
              </p>
              <p className="mt-3 max-w-md text-base leading-7">
                Your phone number holds the USDT. Dial, set a PIN, and send
                to another number. USend settles it on Whitechain. The phone
                holds no key and pays no gas.
              </p>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-[0_10px_30px_rgba(40,50,20,0.12)]">
              <h2 className="text-lg font-extrabold tracking-tight">
                The number is the wallet
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-5">
                <Check>Dial and set a PIN</Check>
                <Check>Pay their phone number</Check>
                <Check>The code is only a short name</Check>
              </ul>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a href={AT_SIMULATOR} className={dialClass}>
                  Dial
                </a>
                <a href="#handset" className={ghostClass}>
                  Use the keypad
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-end gap-6 px-2">
              <p className="rounded-t-lg bg-[#2F80FA] px-4 py-2 text-sm font-semibold text-white">
                On the handset
              </p>
              <a
                href="#how-it-works"
                className="pb-2 text-sm font-medium text-[#23251D]/70"
              >
                Send to a number
              </a>
              <a
                href="#case"
                className="hidden pb-2 text-sm font-medium text-[#23251D]/70 sm:inline"
              >
                Across a border
              </a>
            </div>
            <div
              id="handset"
              className="grid scroll-mt-8 gap-6 rounded-xl border-2 border-[#2F80FA] bg-white p-5 sm:p-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center"
            >
              <PhoneShell />
              <div className="flex flex-col justify-center">
                <h2 className="text-2xl font-extrabold tracking-tight text-[#111827]">
                  The menu is the wallet.
                </h2>
                <p className="mt-3 text-base leading-7">
                  The first dial asks for a PIN, then this number gets a wallet.
                  Dial 1 and enter their phone number. Dial 2 to see the number
                  people should pay. Dial 3 to read the balance. The short code
                  is there when you do not want to give out the number.
                </p>
                <a href={AT_SIMULATOR} className={`${dialClass} mt-5 w-fit`}>
                  Dial {AT_DIAL}
                </a>
                <p
                  className={`${plexMono.className} mt-4 text-xs leading-5 text-[#23251D]/70`}
                >
                  Live menu on the sandbox shortcode.
                </p>
              </div>
            </div>
          </div>

          <section id="why-ussd" className="scroll-mt-24 pt-14">
            <p className={`${plexMono.className} text-xs text-[#23251D]/70`}>
              Sub-Saharan Africa, 2024
            </p>
            <h2 className="mt-3 max-w-[18ch] text-3xl font-extrabold tracking-[-0.03em] text-[#111827] sm:text-4xl">
              The shortcode is already how people move money.
            </h2>
            <dl className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-[#BFC1B7] bg-[#EEEFE9] p-6">
                <dt className="text-5xl font-extrabold tracking-[-0.03em] text-[#111827]">
                  42%
                </dt>
                <dd className="mt-3 max-w-md text-base leading-6">
                  of adults had no account at a bank or a mobile-money service.
                  Account ownership was 58%.
                </dd>
                <dd className="mt-4">
                  <a
                    href={FINDEX_PRESS}
                    className="text-sm font-semibold text-[#2F80FA] underline underline-offset-4"
                  >
                    World Bank, Global Findex 2025
                  </a>
                </dd>
              </div>
              <div className="rounded-lg border border-[#BFC1B7] bg-[#EEEFE9] p-6">
                <dt className="text-5xl font-extrabold tracking-[-0.03em] text-[#111827]">
                  300 million
                </dt>
                <dd className="mt-3 max-w-md text-base leading-6">
                  adults already have a mobile-money account. That is 40% of
                  adults. On a feature phone, that account is reached by dialing
                  USSD.
                </dd>
                <dd className="mt-4">
                  <a
                    href={FINDEX_REPORT}
                    className="text-sm font-semibold text-[#2F80FA] underline underline-offset-4"
                  >
                    World Bank, Global Findex 2025
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          <section id="case" className="scroll-mt-24 pt-14">
            <p className={`${plexMono.className} text-xs text-[#F54E00]`}>
              The case
            </p>
            <h2 className="mt-3 max-w-[16ch] text-3xl font-extrabold tracking-[-0.03em] text-[#111827] sm:text-4xl">
              Same dial. A balance that{" "}
              <span className="rounded-md bg-[#F54E00]/10 px-1 text-[#F54E00]">
                crosses a border.
              </span>
            </h2>
            <ol className="mt-8 divide-y divide-[#BFC1B7] border-y border-[#BFC1B7]">
              <li className="grid gap-3 py-8 lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-10">
                <p className={`${plexMono.className} text-xs text-[#2F80FA]`}>
                  01 · Habit
                </p>
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight">
                    Start from the shortcode they already use.
                  </h3>
                  <p className="mt-3 max-w-2xl text-base leading-7">
                    Three hundred million adults in Sub-Saharan Africa already
                    have a mobile-money account. On a feature phone they reach
                    it by dialing USSD. USend keeps that session: set a PIN, 1
                    to send, 2 to receive, 3 to read the balance. The change is
                    the unit the payment settles in.
                  </p>
                </div>
              </li>
              <li className="grid gap-3 py-8 lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-10">
                <p className={`${plexMono.className} text-xs text-[#2F80FA]`}>
                  02 · Next
                </p>
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight">
                    Give the next accounts the same menu.
                  </h3>
                  <p className="mt-3 max-w-2xl text-base leading-7">
                    In 2024, 42% of adults in the region had no account at a
                    bank or a mobile-money service. About 80 million of those
                    adults already have a phone, an identity document, and a SIM
                    in their own name. They can hold USDT on that number, on
                    the menu their neighbors already know.
                  </p>
                  <a
                    href={FINDEX_REPORT}
                    className={`${plexMono.className} mt-3 inline-block text-xs underline underline-offset-4`}
                  >
                    World Bank, Global Findex 2025
                  </a>
                </div>
              </li>
              <li className="grid gap-3 py-8 lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-10">
                <p className={`${plexMono.className} text-xs text-[#2F80FA]`}>
                  03 · Border
                </p>
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight">
                    Settle both countries in USDT.
                  </h3>
                  <p className="mt-3 max-w-2xl text-base leading-7">
                    A mobile-money transfer pays the local currency of one
                    country. A USend number pays prize USDT on Whitechain, the
                    same token for the sender and the receiver. Country A shares
                    a phone number. Country B dials it. The short code is there
                    when the number stays private. The amount that arrives is
                    USDT. The phone holds none of the gas token. USend&apos;s
                    relayer pays that. One send is at most 100, and it stays
                    open for 15 minutes.
                  </p>
                </div>
              </li>
            </ol>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <div className="rounded-lg border border-[#BFC1B7] bg-white p-6">
                <p className={`${plexMono.className} text-xs text-[#2F80FA]`}>
                  Country A
                </p>
                <p className="mt-2 text-xl font-extrabold tracking-tight">
                  Dial. Share your number.
                </p>
              </div>
              <div className="rounded-lg border border-[#BFC1B7] bg-white p-6">
                <p className={`${plexMono.className} text-xs text-[#F54E00]`}>
                  Whitechain
                </p>
                <p className="mt-2 text-xl font-extrabold tracking-tight">
                  Prize USDT moves.
                </p>
              </div>
              <div className="rounded-lg border border-[#BFC1B7] bg-white p-6">
                <p className={`${plexMono.className} text-xs text-[#2F80FA]`}>
                  Country B
                </p>
                <p className="mt-2 text-xl font-extrabold tracking-tight">
                  Dial 1. Enter their number.
                </p>
              </div>
            </div>
          </section>

          <section id="how-it-works" className="scroll-mt-24 pt-14">
            <p className={`${plexMono.className} text-xs text-[#2F80FA]`}>
              How it works
            </p>
            <h2 className="mt-3 max-w-[18ch] text-3xl font-extrabold tracking-[-0.03em] text-[#111827] sm:text-4xl">
              Open the wallet. Pay a number. Whitechain settles.
            </h2>
            <p className="mt-3 max-w-xl text-base leading-6">
              The first dial sets a PIN and opens a USDT wallet on this phone
              number. Dial 1 to pay another number. USend holds the keys and
              pays the gas.
            </p>
            <ol className="mt-8 grid gap-4 lg:grid-cols-3">
              <li className="flex flex-col gap-3 rounded-lg border border-[#BFC1B7] bg-[#EEEFE9] p-6">
                <p className={`${plexMono.className} text-xs text-[#2F80FA]`}>
                  1. Open
                </p>
                <h3 className="text-2xl font-extrabold tracking-tight">
                  Set a PIN. Get a wallet.
                </h3>
                <p className="text-sm leading-6 sm:text-base">
                  The first dial asks for a 4-digit PIN. This phone number then
                  holds the USDT, and a short code if you would rather not share
                  the number.
                </p>
              </li>
              <li className="flex flex-col gap-3 rounded-lg border border-[#BFC1B7] bg-[#EEEFE9] p-6">
                <p className={`${plexMono.className} text-xs text-[#2F80FA]`}>
                  2. Send
                </p>
                <h3 className="text-2xl font-extrabold tracking-tight">
                  Enter their number, amount, PIN.
                </h3>
                <p className="text-sm leading-6 sm:text-base">
                  Dial {AT_DIAL}. Enter their phone number, the amount, and your
                  PIN. A 6-digit code still works. Hang up and the session ends.
                </p>
                <a href={AT_SIMULATOR} className={`${dialClass} mt-auto w-fit`}>
                  Dial {AT_DIAL}
                </a>
              </li>
              <li className="flex flex-col gap-3 rounded-lg border border-[#BFC1B7] bg-[#EEEFE9] p-6">
                <p className={`${plexMono.className} text-xs text-[#2F80FA]`}>
                  3. Relayer
                </p>
                <h3 className="text-2xl font-extrabold tracking-tight">
                  USend pays the gas.
                </h3>
                <p className="text-sm leading-6 sm:text-base">
                  USend opens a 15-minute payment to their number and submits
                  it. The relayer spends WBT. The payer&apos;s WBT balance stays
                  at zero.
                </p>
                <a
                  href="#ops"
                  className="mt-auto text-sm font-semibold text-[#2F80FA] underline underline-offset-4"
                >
                  Operator
                </a>
              </li>
            </ol>
          </section>

          <section id="ops" className="scroll-mt-8 pt-14">
            <div className="rounded-xl bg-[#14110d] px-5 py-8 sm:px-8">
              <OpsShell />
            </div>
          </section>

          <footer
            className={`${plexMono.className} mt-10 flex gap-6 border-t border-[#BFC1B7] pt-6 text-xs`}
          >
            <a href="#ops" className="text-[#2F80FA] underline underline-offset-4">
              Operator
            </a>
          </footer>
        </article>
      </div>
    </main>
  );
}

function Mark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
      <rect x="2" y="6" width="7" height="16" rx="1.5" fill="#2F80FA" />
      <rect x="11" y="2" width="7" height="20" rx="1.5" fill="#EB9D2A" />
      <rect x="20" y="10" width="6" height="12" rx="1.5" fill="#F54E00" />
    </svg>
  );
}

function Check({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden
        className="mt-0.5 shrink-0"
      >
        <path
          d="M3 8.2 6.2 11.5 13 4.5"
          fill="none"
          stroke="#3d8b40"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{children}</span>
    </li>
  );
}

type RailIcon = "home" | "phone" | "keypad" | "chart" | "path" | "list" | "sliders";

function Rail({
  side,
  items,
}: {
  side: "left" | "right";
  items: { href: string; label: string; icon: RailIcon; external?: boolean }[];
}) {
  return (
    <nav
      aria-label={side === "left" ? "Primary" : "More"}
      className={`fixed top-24 z-20 hidden w-16 flex-col items-center gap-5 lg:flex ${
        side === "left" ? "left-3" : "right-3"
      }`}
    >
      {items.map((item) => {
        const className =
          "flex w-16 flex-col items-center gap-1 text-center text-[10px] font-semibold leading-tight text-[#1c2a12]";
        const inner = (
          <>
            <Icon name={item.icon} />
            {item.label}
          </>
        );
        return item.external ? (
          <a key={item.label} href={item.href} className={className}>
            {inner}
          </a>
        ) : (
          <Link key={item.label} href={item.href} className={className}>
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}

function Icon({ name }: { name: RailIcon }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M4 11.5 12 4l8 7.5" />
        <path d="M7 10.5V20h10v-9.5" />
      </svg>
    );
  }
  if (name === "phone") {
    return (
      <svg {...common}>
        <path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M11 18h2" />
      </svg>
    );
  }
  if (name === "keypad") {
    return (
      <svg {...common}>
        <path d="M8 6h.01M12 6h.01M16 6h.01M8 12h.01M12 12h.01M16 12h.01M8 18h.01M12 18h.01M16 18h.01" />
      </svg>
    );
  }
  if (name === "chart") {
    return (
      <svg {...common}>
        <path d="M4 19h16" />
        <path d="M7 16V9M12 16V5M17 16v-4" />
      </svg>
    );
  }
  if (name === "path") {
    return (
      <svg {...common}>
        <path d="M5 17c4-1 6-7 14-8" />
        <path d="M15 6h4v4" />
      </svg>
    );
  }
  if (name === "list") {
    return (
      <svg {...common}>
        <path d="M9 7h11M9 12h11M9 17h11" />
        <path d="M5 7h.01M5 12h.01M5 17h.01" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 8h10M18 8h2M4 16h2M10 16h10" />
      <circle cx="16" cy="8" r="2" />
      <circle cx="8" cy="16" r="2" />
    </svg>
  );
}
