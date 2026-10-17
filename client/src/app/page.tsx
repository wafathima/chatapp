"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bangers, Fredoka } from "next/font/google";

/* ------------------------------------------------------------------ */
/*  Fonts: Bangers = comic-book headlines, Fredoka = round & friendly   */
/* ------------------------------------------------------------------ */
const display = Bangers({ weight: "400", subsets: ["latin"] });
const body = Fredoka({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

/* Palette
   ink    #2B0B0B  (outlines + hard shadows)
   red    #FF3B2F
   yellow #FFD93B
   orange #FF9F1C
   cream  #FFF3C4
*/
const INK = "#2B0B0B";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: "⚡",
    title: "Zoom-Zoom Messages",
    description:
      "Messages fly in real time with Socket.IO. No refreshing, no waiting, no excuses.",
    card: "bg-[#FFD93B] text-[#2B0B0B] -rotate-2",
  },
  {
    icon: "🕵️",
    title: "Hide Your Chats",
    description:
      "Tuck any chat behind your own secret PIN. Only you can sneak a peek.",
    card: "bg-[#FF3B2F] text-white rotate-1",
  },
  {
    icon: "📦",
    title: "Archive Old Chats",
    description:
      "Clear the clutter without losing a thing. Archived chats come back with one tap.",
    card: "bg-white text-[#2B0B0B] rotate-2",
  },
  {
    icon: "🗑️",
    title: "Delete Anything",
    description:
      "Done with a chat or sent something silly? Poof! Delete it and move on.",
    card: "bg-[#FF9F1C] text-[#2B0B0B] -rotate-1",
  },
];

const stickerPack = [
  { emoji: "🔥", label: "Hot take", rot: "-rotate-6", bg: "bg-[#FFD93B]" },
  { emoji: "🍕", label: "Pizza time", rot: "rotate-3", bg: "bg-white" },
  { emoji: "🤡", label: "Big mood", rot: "-rotate-3", bg: "bg-[#FF3B2F]" },
  { emoji: "💀", label: "I'm dead", rot: "rotate-6", bg: "bg-[#FFF3C4]" },
  { emoji: "🌶️", label: "Spicy", rot: "rotate-2", bg: "bg-[#FF9F1C]" },
  { emoji: "🦄", label: "Magical", rot: "-rotate-2", bg: "bg-white" },
  { emoji: "💥", label: "Boom", rot: "rotate-6", bg: "bg-[#FFD93B]" },
  { emoji: "🎉", label: "Party", rot: "-rotate-6", bg: "bg-[#FF3B2F]" },
  { emoji: "😎", label: "Too cool", rot: "rotate-3", bg: "bg-[#FFF3C4]" },
  { emoji: "👽", label: "Sus", rot: "-rotate-3", bg: "bg-white" },
  { emoji: "👻", label: "Ghosted", rot: "rotate-2", bg: "bg-[#FF9F1C]" },
  { emoji: "🧨", label: "Chaos", rot: "-rotate-6", bg: "bg-[#FFD93B]" },
];

const quotes = [
  {
    text: "I opened EnChat for 2 minutes. That was 4 hours ago.",
    who: "Sarah J.",
    bg: "bg-white",
    rot: "-rotate-2",
  },
  {
    text: "Our group chat has 400 unread stickers and zero regrets.",
    who: "Mike C.",
    bg: "bg-[#FFD93B]",
    rot: "rotate-1",
  },
  {
    text: "Dev team approved. Mostly because of the pizza sticker.",
    who: "The Dev Team",
    bg: "bg-white",
    rot: "rotate-2",
  },
];

const ticker = [
  "NO RULES",
  "JUST VIBES",
  "STICKERS EVERYWHERE",
  "SEND IT",
  "CHAOS WELCOME",
  "PIZZA > HOMEWORK",
];

const stickerTray = ["🔥", "💀", "🍕", "🦄", "💥", "🤡"];

const replies = [
  "LMAOOO 😭",
  "ok but that's actually genius",
  "send more stickers!!",
  "I can't breathe 💀",
  "brb telling everyone",
  "this is why I love EnChat",
  "WHAT 😂",
  "chaos approved ✅",
];

const rainEmojis = ["🔥", "💥", "🍕", "⭐", "🎉", "🧨", "💬", "🤡", "🌶️", "💛", "❤️", "🦄"];

type Msg = { id: number; from: "me" | "them"; text: string; big?: boolean };
type Drop = {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  size: number;
  dur: number;
};

/* ------------------------------------------------------------------ */
/*  Little SVG + UI pieces                                             */
/* ------------------------------------------------------------------ */
function Burst({
  children,
  className = "",
  fill = "#FFD93B",
}: {
  children?: React.ReactNode;
  className?: string;
  fill?: string;
}) {
  const points = Array.from({ length: 32 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 32;
    const r = i % 2 === 0 ? 48 : 35;
    return `${(50 + r * Math.cos(angle)).toFixed(2)},${(
      50 +
      r * Math.sin(angle)
    ).toFixed(2)}`;
  }).join(" ");

  return (
    <div className={`relative grid place-items-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <polygon
          points={points}
          fill={fill}
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
      <span className="relative text-center leading-none">{children}</span>
    </div>
  );
}

function Bubble({
  children,
  className = "",
  tail = "left-6",
}: {
  children: React.ReactNode;
  className?: string;
  tail?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border-4 border-[#2B0B0B] bg-white px-4 py-2 font-bold shadow-[4px_4px_0_#2B0B0B] ${className}`}
    >
      {children}
      <span
        className={`absolute -bottom-[11px] ${tail} h-4 w-4 rotate-45 border-b-4 border-r-4 border-[#2B0B0B] bg-white`}
      />
    </div>
  );
}

function Mascot({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="EnChat mascot, a grinning red speech bubble">
      {/* tuft */}
      <path
        d="M92 26 L98 4 L108 20 L120 2 L120 28"
        fill="#FFD93B"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* body */}
      <path
        d="M100 22 C160 22 180 60 176 92 C172 126 140 142 105 142 L82 142 L40 182 L52 136 C28 124 22 102 24 80 C26 45 55 22 100 22 Z"
        fill="#FF3B2F"
        stroke={INK}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* shine */}
      <path
        d="M52 56 C60 44 74 38 88 36"
        fill="none"
        stroke="#fff"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* eyes */}
      <circle cx="76" cy="78" r="17" fill="#fff" stroke={INK} strokeWidth="5" />
      <circle cx="126" cy="78" r="17" fill="#fff" stroke={INK} strokeWidth="5" />
      <circle cx="81" cy="80" r="7" fill={INK} />
      <circle cx="121" cy="80" r="7" fill={INK} />
      <circle cx="83" cy="77" r="2.5" fill="#fff" />
      <circle cx="123" cy="77" r="2.5" fill="#fff" />
      {/* brows */}
      <path d="M58 54 L90 60" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <path d="M144 54 L112 60" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      {/* cheeks */}
      <ellipse cx="50" cy="104" rx="10" ry="7" fill="#FFD93B" opacity="0.9" />
      <ellipse cx="152" cy="104" rx="10" ry="7" fill="#FFD93B" opacity="0.9" />
      {/* mouth */}
      <path
        d="M68 104 Q101 148 134 104 Z"
        fill={INK}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M88 124 Q101 112 114 124 Q101 140 88 124 Z" fill="#FF8FA3" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  const d = display.className;

  const [messages, setMessages] = useState<Msg[]>([
    { id: 1, from: "them", text: "yo did u see the cat?? 🐱" },
    { id: 2, from: "me", text: "SEEN IT. I'm screaming" },
    { id: 3, from: "them", text: "send a sticker rn" },
  ]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [rain, setRain] = useState<Drop[]>([]);
  const [shaking, setShaking] = useState(false);

  const nextId = useRef(4);
  const listRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const send = (text: string, big = false) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((m) => [...m, { id: nextId.current++, from: "me", text: clean, big }]);
    setTyping(true);
    const t = setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: nextId.current++,
          from: "them",
          text: replies[Math.floor(Math.random() * replies.length)],
        },
      ]);
      setTyping(false);
    }, 900);
    timers.current.push(t);
  };

  const chaos = () => {
    const batch: Drop[] = Array.from({ length: 40 }, (_, i) => ({
      id: Date.now() + i,
      emoji: rainEmojis[Math.floor(Math.random() * rainEmojis.length)],
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      size: 24 + Math.random() * 40,
      dur: 2.2 + Math.random() * 1.8,
    }));
    setRain((r) => [...r, ...batch]);
    setShaking(true);
    timers.current.push(setTimeout(() => setShaking(false), 600));
    timers.current.push(
      setTimeout(() => setRain((r) => r.filter((x) => !batch.includes(x))), 5200)
    );
  };

  const btn =
    "inline-flex items-center gap-2 rounded-full border-4 border-[#2B0B0B] px-7 py-3.5 text-lg font-bold shadow-[5px_5px_0_#2B0B0B] transition hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[2px_2px_0_#2B0B0B] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#2B0B0B]";

  return (
    <>
      <style>{`
        @keyframes wobble { 0%,100% { transform: rotate(-4deg) } 50% { transform: rotate(4deg) } }
        @keyframes floaty { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes fall { from { transform: translateY(-12vh) rotate(0deg); opacity: 1 } to { transform: translateY(112vh) rotate(720deg); opacity: 1 } }
        @keyframes shake { 0%,100% { transform: translate(0,0) } 20% { transform: translate(-8px,4px) rotate(-.4deg) } 40% { transform: translate(8px,-4px) rotate(.4deg) } 60% { transform: translate(-6px,-3px) } 80% { transform: translate(6px,3px) } }
        @keyframes pop { 0% { transform: scale(.4); opacity: 0 } 70% { transform: scale(1.12) } 100% { transform: scale(1); opacity: 1 } }
        .wobble { animation: wobble 2.4s ease-in-out infinite }
        .floaty { animation: floaty 3.2s ease-in-out infinite }
        .marquee { animation: marquee 22s linear infinite }
        .fall { animation-name: fall; animation-timing-function: linear; animation-fill-mode: both }
        .shake { animation: shake .6s ease-in-out }
        .pop { animation: pop .35s ease-out both }
        @media (prefers-reduced-motion: reduce) {
          .wobble, .floaty, .marquee, .shake, .pop { animation: none !important }
          .fall { display: none }
        }
      `}</style>

      <main
        className={`${body.className} relative min-h-screen overflow-hidden bg-[#FFF3C4] text-[#2B0B0B] ${
          shaking ? "shake" : ""
        }`}
        style={{
          backgroundImage: "radial-gradient(#FFD93B 2px, transparent 2.5px)",
          backgroundSize: "22px 22px",
        }}
      >
        {/* Ticker */}
        <div className="overflow-hidden border-b-4 border-[#2B0B0B] bg-[#FF3B2F] py-2 text-[#FFD93B]">
          <div className={`${d} marquee flex w-max text-xl tracking-wider`}>
            {[0, 1].map((g) => (
              <div key={g} className="flex shrink-0 items-center" aria-hidden={g === 1}>
                {ticker.map((t) => (
                  <span key={t + g} className="flex items-center">
                    <span className="px-6">{t}</span>
                    <span>★</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Navbar */}
        <header className="border-b-4 border-[#2B0B0B] bg-[#FFF3C4]/90 backdrop-blur">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
            <Link href="/" className="flex items-center gap-3">
              <span className="wobble flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-[#2B0B0B] bg-[#FF3B2F] text-2xl shadow-[3px_3px_0_#2B0B0B]">
                💬
              </span>
              <span
                className={`${d} text-4xl tracking-wide text-[#FF3B2F] [text-shadow:2px_2px_0_#2B0B0B]`}
              >
                En<span className="text-[#FFD93B]">Chat</span>
              </span>
            </Link>

            <div className="hidden items-center gap-8 text-lg font-semibold md:flex">
              <a href="#home" className="rounded-full bg-[#FFD93B] px-4 py-1 border-2 border-[#2B0B0B]">
                Home
              </a>
              <a href="#try" className="hover:-rotate-3 transition hover:text-[#FF3B2F]">
                Try it
              </a>
              <a href="#features" className="hover:rotate-3 transition hover:text-[#FF3B2F]">
                Features
              </a>
              <a href="#stickers" className="hover:-rotate-3 transition hover:text-[#FF3B2F]">
                Stickers
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full border-4 border-[#2B0B0B] bg-white px-4 py-2 text-sm font-bold shadow-[3px_3px_0_#2B0B0B] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_#2B0B0B] sm:px-5"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full border-4 border-[#2B0B0B] bg-[#FF3B2F] px-4 py-2 text-sm font-bold text-white shadow-[3px_3px_0_#2B0B0B] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_#2B0B0B] sm:px-5"
              >
                Sign up
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero */}
        <section
          id="home"
          className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 lg:grid-cols-2 lg:px-10 lg:py-20"
        >
          <div className="relative z-10">
            <div className="mb-6 inline-block -rotate-2 rounded-full border-4 border-[#2B0B0B] bg-[#FFD93B] px-5 py-2 text-base font-bold shadow-[4px_4px_0_#2B0B0B]">
              ★ The chat app with zero chill
            </div>

            <h1
              className={`${d} text-6xl leading-[1.05] tracking-wide sm:text-7xl xl:text-8xl`}
            >
              <span className="inline-block -rotate-3 rounded-2xl border-4 border-[#2B0B0B] bg-[#FFD93B] px-4 shadow-[6px_6px_0_#2B0B0B]">
                Chat.
              </span>{" "}
              <span className="inline-block rotate-2 rounded-2xl border-4 border-[#2B0B0B] bg-[#FF3B2F] px-4 text-white shadow-[6px_6px_0_#2B0B0B] [text-shadow:3px_3px_0_#2B0B0B]">
                Chaos.
              </span>{" "}
              <span className="mt-3 inline-block -rotate-1 rounded-2xl border-4 border-[#2B0B0B] bg-white px-4 shadow-[6px_6px_0_#2B0B0B]">
                Repeat.
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-xl font-medium leading-8">
              EnChat is the chat app where nothing is serious. Send messages in real
              time, slap stickers on everything, and start group chats that go
              completely off the rails.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/register" className={`${btn} bg-[#FF3B2F] text-white`}>
                Start the chaos <span aria-hidden="true">🚀</span>
              </Link>
              <a href="#try" className={`${btn} bg-white`}>
                Peek inside <span aria-hidden="true">👀</span>
              </a>
            </div>

            <ul className="mt-8 flex flex-wrap gap-2 text-sm font-bold">
              {["Next.js", "Node.js", "Socket.IO", "PostgreSQL"].map((t, i) => (
                <li
                  key={t}
                  className={`rounded-full border-2 border-[#2B0B0B] px-3 py-1 ${
                    i % 2 ? "rotate-2 bg-[#FFD93B]" : "-rotate-2 bg-white"
                  }`}
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Mascot scene */}
          <div className="relative mx-auto aspect-square w-full max-w-[480px]">
            <div className="absolute inset-[6%] rounded-full border-4 border-[#2B0B0B] bg-[#FFD93B] shadow-[10px_10px_0_#2B0B0B]" />
            <div
              className="absolute inset-[6%] rounded-full opacity-60"
              style={{
                backgroundImage: "radial-gradient(#FF9F1C 3px, transparent 3.5px)",
                backgroundSize: "18px 18px",
              }}
            />
            <Mascot className="floaty absolute inset-[10%] h-[80%] w-[80%] drop-shadow-[6px_6px_0_rgba(43,11,11,0.35)]" />

            <Bubble className="wobble absolute -left-2 top-[4%] -rotate-6 text-xl">
              hiii!! 👋
            </Bubble>
            <Bubble
              className="floaty absolute -right-2 bottom-[10%] rotate-3 text-xl"
              tail="right-6"
            >
              BRB, pizza 🍕
            </Bubble>

            <Burst className={`${d} wobble absolute -right-3 top-[2%] h-28 w-28 text-2xl`}>
              <span className="block -rotate-12 text-[#2B0B0B]">100%<br />FUN!</span>
            </Burst>
            <Burst
              fill="#FF3B2F"
              className={`${d} floaty absolute -left-4 bottom-[6%] h-24 w-24 text-xl text-white`}
            >
              <span className="block rotate-12 [text-shadow:2px_2px_0_#2B0B0B]">POW!</span>
            </Burst>

            {[
              { e: "⭐", c: "left-[16%] bottom-[2%] text-5xl rotate-12" },
              { e: "🔥", c: "right-[20%] top-[-2%] text-5xl -rotate-12" },
              { e: "💥", c: "left-[-3%] top-[44%] text-5xl -rotate-6" },
              { e: "🎈", c: "right-[-2%] top-[46%] text-5xl rotate-6" },
            ].map((s, i) => (
              <span
                key={i}
                aria-hidden="true"
                style={{ animationDelay: `${i * 0.4}s` }}
                className={`floaty absolute select-none drop-shadow-[3px_3px_0_#2B0B0B] ${s.c}`}
              >
                {s.e}
              </span>
            ))}
          </div>
        </section>

        {/* Try it */}
        <section id="try" className="border-y-4 border-[#2B0B0B] bg-[#FF3B2F] py-16 lg:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[1fr_1.1fr] lg:px-10">
            <div className="text-white">
              <h2
                className={`${d} text-5xl leading-none tracking-wide sm:text-6xl [text-shadow:4px_4px_0_#2B0B0B]`}
              >
                Try it.
                <br />
                Seriously.
              </h2>
              <p className="mt-6 max-w-md text-xl font-medium leading-8">
                This chat is live. Type something or smash a sticker and see what
                comes back. Your friends will reply even faster.
              </p>
              <div className="mt-6 inline-block rotate-2 rounded-2xl border-4 border-[#2B0B0B] bg-[#FFD93B] px-4 py-2 font-bold text-[#2B0B0B] shadow-[4px_4px_0_#2B0B0B]">
                👇 Slap a sticker below
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="overflow-hidden rounded-3xl border-4 border-[#2B0B0B] bg-white shadow-[10px_10px_0_#2B0B0B]">
                {/* header */}
                <div className="flex items-center gap-3 border-b-4 border-[#2B0B0B] bg-[#FFD93B] px-4 py-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-[#2B0B0B] bg-[#FF3B2F] text-xl font-bold text-white">
                    S
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">Sarah Johnson</p>
                    <p className="text-xs font-semibold" aria-live="polite">
                      {typing ? "typing… ✍️" : "● online"}
                    </p>
                  </div>
                  <span className="text-2xl" aria-hidden="true">🎉</span>
                </div>

                {/* messages */}
                <div
                  ref={listRef}
                  className="flex h-80 flex-col gap-3 overflow-y-auto bg-[#FFF3C4] p-4"
                  aria-label="Chat messages"
                >
                  {messages.map((m) =>
                    m.big ? (
                      <span
                        key={m.id}
                        className={`pop select-none text-6xl drop-shadow-[3px_3px_0_#2B0B0B] ${
                          m.from === "me" ? "self-end" : "self-start"
                        }`}
                      >
                        {m.text}
                      </span>
                    ) : (
                      <div
                        key={m.id}
                        className={`pop max-w-[80%] rounded-2xl border-[3px] border-[#2B0B0B] px-4 py-2 font-semibold shadow-[3px_3px_0_#2B0B0B] ${
                          m.from === "me"
                            ? "self-end rounded-br-sm bg-[#FFD93B]"
                            : "self-start rounded-bl-sm bg-white"
                        }`}
                      >
                        {m.text}
                      </div>
                    )
                  )}
                </div>

                {/* sticker tray */}
                <div className="flex items-center gap-2 overflow-x-auto border-t-4 border-[#2B0B0B] bg-white px-3 py-2">
                  {stickerTray.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s, true)}
                      aria-label={`Send ${s} sticker`}
                      className="shrink-0 rounded-xl border-[3px] border-[#2B0B0B] bg-[#FFF3C4] px-3 py-1 text-2xl shadow-[2px_2px_0_#2B0B0B] transition hover:-translate-y-1 hover:rotate-6 active:translate-y-0.5"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(draft);
                    setDraft("");
                  }}
                  className="flex gap-2 border-t-4 border-[#2B0B0B] bg-[#FFD93B] p-3"
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Say something silly…"
                    aria-label="Type a message"
                    className="min-w-0 flex-1 rounded-full border-4 border-[#2B0B0B] bg-white px-4 py-2 font-medium outline-none placeholder:text-[#2B0B0B]/50 focus:ring-4 focus:ring-[#FF3B2F]/40"
                  />
                  <button
                    type="submit"
                    aria-label="Send message"
                    className="rounded-full border-4 border-[#2B0B0B] bg-[#FF3B2F] px-5 font-bold text-white shadow-[3px_3px_0_#2B0B0B] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_#2B0B0B]"
                  >
                    Send
                  </button>
                </form>
              </div>

              <span
                aria-hidden="true"
                className="floaty absolute -right-4 -top-8 text-6xl drop-shadow-[3px_3px_0_#2B0B0B]"
              >
                💬
              </span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28">
          <div className="mb-14 flex flex-wrap items-center gap-4">
            <h2 className={`${d} text-5xl tracking-wide sm:text-6xl`}>
              Why EnChat?
            </h2>
            <Burst className={`${d} wobble h-24 w-24 text-lg`} fill="#FF9F1C">
              <span className="block rotate-12">COOL<br />STUFF</span>
            </Burst>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <article
                key={f.title}
                className={`${f.card} rounded-3xl border-4 border-[#2B0B0B] p-6 shadow-[8px_8px_0_#2B0B0B] transition hover:-translate-y-2 hover:rotate-0`}
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#2B0B0B] bg-white text-3xl shadow-[3px_3px_0_#2B0B0B]">
                  {f.icon}
                </div>
                <h3 className={`${d} text-3xl tracking-wide`}>{f.title}</h3>
                <p className="mt-3 text-base font-medium leading-6">{f.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Sticker wall */}
        <section
          id="stickers"
          className="border-y-4 border-[#2B0B0B] bg-[#FFD93B] py-16 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-5 lg:px-10">
            <h2 className={`${d} text-5xl tracking-wide sm:text-6xl`}>
              The Sticker Pack{" "}
              <span className="inline-block rotate-6 text-[#FF3B2F] [text-shadow:3px_3px_0_#2B0B0B]">
                (it is huge)
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-xl font-medium">
              Words are boring. Say it with a flaming pizza instead.
            </p>

            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
              {stickerPack.map((s) => (
                <div
                  key={s.label}
                  className={`${s.bg} ${s.rot} flex flex-col items-center gap-2 rounded-3xl border-4 border-[#2B0B0B] px-3 py-6 shadow-[6px_6px_0_#2B0B0B] transition hover:scale-110 hover:rotate-0`}
                >
                  <span className="text-6xl drop-shadow-[3px_3px_0_rgba(43,11,11,0.3)]">
                    {s.emoji}
                  </span>
                  <span
                    className={`${d} text-xl tracking-wide ${
                      s.bg === "bg-[#FF3B2F]" ? "text-white" : ""
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quotes */}
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28">
          <h2 className={`${d} mb-14 text-5xl tracking-wide sm:text-6xl`}>
            Your friends will say:
          </h2>
          <div className="grid gap-10 md:grid-cols-3">
            {quotes.map((q, i) => (
              <figure key={q.who} className={q.rot}>
                <Bubble className={`${q.bg} !px-6 !py-5 text-xl leading-7`} tail={i % 2 ? "right-10" : "left-10"}>
                  “{q.text}”
                </Bubble>
                <figcaption className={`${d} mt-6 text-2xl tracking-wide ${i % 2 ? "text-right" : ""}`}>
                  — {q.who}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="about" className="px-5 pb-20 lg:px-10">
          <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 overflow-hidden rounded-[2rem] border-4 border-[#2B0B0B] bg-[#FF3B2F] p-10 text-center text-white shadow-[10px_10px_0_#2B0B0B] sm:p-16">
            <span aria-hidden="true" className="floaty absolute left-5 top-5 text-5xl">🎉</span>
            <span aria-hidden="true" className="floaty absolute right-6 top-8 text-5xl [animation-delay:.6s]">🧨</span>
            <span aria-hidden="true" className="floaty absolute bottom-6 left-10 text-5xl [animation-delay:1s]">🍕</span>
            <span aria-hidden="true" className="floaty absolute bottom-5 right-10 text-5xl [animation-delay:.3s]">🦄</span>

            <h2
              className={`${d} relative max-w-3xl text-5xl leading-none tracking-wide sm:text-7xl [text-shadow:4px_4px_0_#2B0B0B]`}
            >
              Ready to make a mess?
            </h2>
            <p className="relative max-w-xl text-xl font-medium">
              Make an account, grab your friends, and start the loudest chat of your
              life.
            </p>
            <Link
              href="/register"
              className={`${btn} relative bg-[#FFD93B] text-2xl text-[#2B0B0B]`}
            >
              Join EnChat <span aria-hidden="true">💥</span>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t-4 border-[#2B0B0B] bg-[#2B0B0B] px-5 py-8 text-[#FFD93B] lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
            <p className={`${d} text-2xl tracking-wide`}>
              © {new Date().getFullYear()} EnChat. Made with 🔥 and way too much pizza.
            </p>
            <div className="flex gap-6 text-lg font-semibold">
              <Link href="/login" className="transition hover:text-white">
                Log in
              </Link>
              <Link href="/register" className="transition hover:text-white">
                Sign up
              </Link>
            </div>
          </div>
        </footer>
      </main>

      {/* Chaos button (outside <main> so the shake doesn't move it) */}
      <button
        type="button"
        onClick={chaos}
        className={`${d} wobble fixed bottom-5 right-5 z-40 rounded-full border-4 border-[#2B0B0B] bg-[#FF3B2F] px-6 py-3 text-2xl tracking-wide text-white shadow-[5px_5px_0_#2B0B0B] transition hover:scale-110 active:scale-95 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#2B0B0B]`}
      >
        PRESS ME 🧨
      </button>

      {/* Emoji rain */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
        {rain.map((r) => (
          <span
            key={r.id}
            className="fall absolute top-0 select-none"
            style={{
              left: `${r.left}%`,
              fontSize: r.size,
              animationDelay: `${r.delay}s`,
              animationDuration: `${r.dur}s`,
            }}
          >
            {r.emoji}
          </span>
        ))}
      </div>
    </>
  );
}