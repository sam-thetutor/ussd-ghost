"use client";

import { useCallback, useEffect, useState } from "react";

const SERVICE = "*384*71618#";
const BANNER = "USSD simulator — not a live MNO session.";

type Mode = "idle" | "session" | "ended";

export function PhoneShell() {
  const phone = process.env.NEXT_PUBLIC_DEMO_PHONE || "+254700000001";
  const [mode, setMode] = useState<Mode>("idle");
  const [dial, setDial] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [hops, setHops] = useState<string[]>([]);
  const [buffer, setBuffer] = useState("");
  const [screen, setScreen] = useState("Dial *384*71618#");
  const [busy, setBusy] = useState(false);

  const resetIdle = useCallback(() => {
    setMode("idle");
    setDial("");
    setSessionId("");
    setHops([]);
    setBuffer("");
    setScreen("Dial *384*71618#");
    setBusy(false);
  }, []);

  useEffect(() => {
    const onHide = () => resetIdle();
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [resetIdle]);

  async function postUssd(text: string, sid: string) {
    setBusy(true);
    try {
      const body = new URLSearchParams({
        sessionId: sid,
        phoneNumber: phone,
        serviceCode: SERVICE,
        text,
      });
      const res = await fetch("/api/ussd", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const raw = await res.text();
      const isEnd = raw.startsWith("END ");
      const message = raw.replace(/^(CON|END) /, "");
      setScreen(message);
      if (isEnd) {
        setMode("ended");
        setBuffer("");
      } else {
        setMode("session");
        setBuffer("");
      }
    } finally {
      setBusy(false);
    }
  }

  function press(key: string) {
    if (busy) return;
    if (mode === "ended") {
      resetIdle();
      return;
    }
    if (mode === "idle") {
      setDial((d) => (d + key).slice(0, 16));
      return;
    }
    setBuffer((b) => (b + key).slice(0, 24));
  }

  async function call() {
    if (busy) return;
    if (mode === "ended") {
      resetIdle();
      return;
    }
    if (mode === "idle") {
      if (dial !== SERVICE) {
        setScreen("Not a USend shortcode.\nTry *384*71618#");
        return;
      }
      const sid = crypto.randomUUID();
      setSessionId(sid);
      setHops([]);
      await postUssd("", sid);
      return;
    }
    const next = buffer ? [...hops, buffer] : hops;
    setHops(next);
    await postUssd(next.join("*"), sessionId);
  }

  function hang() {
    resetIdle();
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-[280px] rounded-[2.4rem] border-4 border-[#1a2a24] bg-[#2f4a40] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
        <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-[#d7e3c4]">
          {BANNER}
        </p>
        <div className="mb-3 rounded-sm bg-[#1b2416] p-1">
          <div className="min-h-[168px] rounded-sm bg-[#9cb56f] px-3 py-2 font-mono text-[13px] leading-5 text-[#1b2416]">
            <div className="mb-1 flex justify-between text-[10px] opacity-70">
              <span>{phone}</span>
              <span>{busy ? "…" : mode === "idle" ? "idle" : "USSD"}</span>
            </div>
            <pre className="whitespace-pre-wrap">
              {mode === "idle" ? `${screen}\n\n${dial || "_"}` : `${screen}\n\n>${buffer}`}
            </pre>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {keys.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              className="rounded-full bg-[#243830] py-2 font-mono text-lg text-[#e6f0dc] shadow-inner hover:bg-[#2d4a3e]"
            >
              {k}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={call}
            className="rounded-full bg-[#3d8f4a] py-2 font-mono text-sm text-white"
          >
            Call / Send
          </button>
          <button
            type="button"
            onClick={hang}
            className="rounded-full bg-[#8f3d3d] py-2 font-mono text-sm text-white"
          >
            Hang up
          </button>
        </div>
      </div>
    </div>
  );
}
