"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Bangers, Fredoka } from "next/font/google";

/* Palette
   ink    #2B0B0B   red    #FF3B2F   yellow #FFD93B
   orange #FF9F1C   cream  #FFF3C4
*/
export const display = Bangers({ weight: "400", subsets: ["latin"] });
export const body = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const INK = "#2B0B0B";

/* Halftone dot background used on every page */
export const pageBg = {
  backgroundImage: "radial-gradient(#FFD93B 2px, transparent 2.5px)",
  backgroundSize: "22px 22px",
} as const;

/* Shared class strings */
export const labelCls = "mb-2 block text-base font-bold";

export const inputCls =
  "w-full rounded-xl border-4 border-[#2B0B0B] bg-[#FFF3C4] px-4 py-3 font-medium outline-none transition placeholder:text-[#2B0B0B]/45 focus:bg-white focus:ring-4 focus:ring-[#FF3B2F]/40";

export const primaryBtn =
  "w-full rounded-full border-4 border-[#2B0B0B] bg-[#FF3B2F] px-6 py-3 text-lg font-bold text-white shadow-[5px_5px_0_#2B0B0B] transition hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[2px_2px_0_#2B0B0B] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#2B0B0B] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[5px_5px_0_#2B0B0B]";

/* Keyframes (respects reduced motion) */
export function ThemeStyles() {
  return (
    <style>{`
      @keyframes wobble { 0%,100% { transform: rotate(-4deg) } 50% { transform: rotate(4deg) } }
      @keyframes floaty { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
      @keyframes pop { 0% { transform: scale(.5); opacity: 0 } 70% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }
      .wobble { animation: wobble 2.4s ease-in-out infinite }
      .floaty { animation: floaty 3.2s ease-in-out infinite }
      .pop { animation: pop .35s ease-out both }
      @media (prefers-reduced-motion: reduce) {
        .wobble, .floaty, .pop { animation: none !important }
      }
    `}</style>
  );
}

/* Logo */
export function Logo() {
  return (
    <span className="flex items-center gap-3">
      <span className="wobble flex h-11 w-11 items-center justify-center rounded-2xl border-4 border-[#2B0B0B] bg-[#FF3B2F] text-xl shadow-[3px_3px_0_#2B0B0B]">
        💬
      </span>
      <span
        className={`${display.className} text-4xl tracking-wide text-[#FF3B2F] [text-shadow:2px_2px_0_#2B0B0B]`}
      >
        En<span className="text-[#FFD93B]">Chat</span>
      </span>
    </span>
  );
}

/* Speech bubble */
export function Bubble({
  children,
  className = "",
  tail = "left-6",
}: {
  children: ReactNode;
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

/* Mascot */
export function Mascot({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="EnChat mascot, a grinning red speech bubble"
    >
      <path
        d="M92 26 L98 4 L108 20 L120 2 L120 28"
        fill="#FFD93B"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M100 22 C160 22 180 60 176 92 C172 126 140 142 105 142 L82 142 L40 182 L52 136 C28 124 22 102 24 80 C26 45 55 22 100 22 Z"
        fill="#FF3B2F"
        stroke={INK}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M52 56 C60 44 74 38 88 36"
        fill="none"
        stroke="#fff"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="76" cy="78" r="17" fill="#fff" stroke={INK} strokeWidth="5" />
      <circle cx="126" cy="78" r="17" fill="#fff" stroke={INK} strokeWidth="5" />
      <circle cx="81" cy="80" r="7" fill={INK} />
      <circle cx="121" cy="80" r="7" fill={INK} />
      <circle cx="83" cy="77" r="2.5" fill="#fff" />
      <circle cx="123" cy="77" r="2.5" fill="#fff" />
      <path d="M58 54 L90 60" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <path d="M144 54 L112 60" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="50" cy="104" rx="10" ry="7" fill="#FFD93B" opacity="0.9" />
      <ellipse cx="152" cy="104" rx="10" ry="7" fill="#FFD93B" opacity="0.9" />
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

/* Error / success boxes */
export function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="pop rounded-xl border-4 border-[#2B0B0B] bg-[#FFD93B] px-4 py-3 text-sm font-bold shadow-[3px_3px_0_#2B0B0B]"
    >
      <span aria-hidden="true">💥 </span>
      {children}
    </p>
  );
}

export function SuccessBox({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="pop rounded-xl border-4 border-[#2B0B0B] bg-white px-4 py-3 text-sm font-bold shadow-[3px_3px_0_#2B0B0B]"
    >
      <span aria-hidden="true">🎉 </span>
      {children}
    </p>
  );
}

/* Shared shell for login + register */
export function AuthShell({
  title,
  subtitle,
  bubble,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  bubble: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const decor = [
    { e: "🔥", c: "left-[7%] top-[20%] -rotate-12 text-6xl", d: "0s" },
    { e: "💥", c: "left-[11%] bottom-[14%] rotate-6 text-6xl", d: ".5s" },
    { e: "🍕", c: "right-[9%] top-[24%] rotate-12 text-6xl", d: ".9s" },
    { e: "⭐", c: "right-[8%] bottom-[16%] -rotate-6 text-6xl", d: ".3s" },
  ];

  return (
    <main
      className={`${body.className} relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#FFF3C4] px-4 py-24 text-[#2B0B0B]`}
      style={pageBg}
    >
      <ThemeStyles />

      <Link
        href="/"
        aria-label="EnChat home"
        className="absolute left-5 top-5 rounded-2xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#2B0B0B]"
      >
        <Logo />
      </Link>

      {decor.map((s) => (
        <span
          key={s.e}
          aria-hidden="true"
          style={{ animationDelay: s.d }}
          className={`floaty pointer-events-none absolute hidden select-none drop-shadow-[3px_3px_0_#2B0B0B] lg:block ${s.c}`}
        >
          {s.e}
        </span>
      ))}

      <div className="relative w-full max-w-md">
        {/* Mascot peeking over the card */}
        <div className="relative z-10 mx-auto -mb-10 w-32">
          <Mascot className="floaty w-full drop-shadow-[4px_4px_0_rgba(43,11,11,0.3)]" />
          <Bubble
            className="wobble absolute left-[78%] top-0 -rotate-3 whitespace-nowrap text-sm"
            tail="left-4"
          >
            {bubble}
          </Bubble>
        </div>

        <div className="rounded-3xl border-4 border-[#2B0B0B] bg-white p-8 pt-14 shadow-[10px_10px_0_#2B0B0B]">
          <div className="mb-8 text-center">
            <h1
              className={`${display.className} text-5xl leading-none tracking-wide text-[#FF3B2F] [text-shadow:3px_3px_0_#2B0B0B]`}
            >
              {title}
            </h1>
            <p className="mt-3 text-base font-medium">{subtitle}</p>
          </div>

          {children}
        </div>

        <div className="mx-auto mt-8 w-fit -rotate-1 rounded-full border-4 border-[#2B0B0B] bg-[#FFD93B] px-5 py-2 text-center text-sm font-bold shadow-[4px_4px_0_#2B0B0B]">
          {footer}
        </div>
      </div>
    </main>
  );
}