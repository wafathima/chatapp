// components/PinModal.tsx
"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Mascot, ThemeStyles, display } from "@/components/EnChatTheme";

type PinModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (pin: string) => void | Promise<void>;
};

export default function PinModal({
  open,
  title,
  onClose,
  onSubmit,
}: PinModalProps) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);

  // Close with the Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pin.length < 4 || busy) return;
    setBusy(true);
    try {
      await onSubmit(pin);
      setPin("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B0B0B]/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-modal-title"
    >
      <ThemeStyles />

      <form
        onSubmit={submit}
        className="pop relative w-full max-w-sm rounded-3xl border-4 border-[#2B0B0B] bg-white p-6 pt-10 text-[#2B0B0B] shadow-[10px_10px_0_#2B0B0B]"
      >
        {/* Mascot peeking over the card */}
        <div className="absolute -top-14 left-1/2 w-24 -translate-x-1/2">
          <Mascot className="floaty w-full drop-shadow-[3px_3px_0_rgba(43,11,11,0.3)]" />
        </div>
        <span
          aria-hidden="true"
          className="wobble absolute -right-4 -top-6 text-5xl drop-shadow-[3px_3px_0_#2B0B0B]"
        >
          🔒
        </span>

        <h3
          id="pin-modal-title"
          className={`${display.className} mt-4 text-center text-4xl leading-none tracking-wide text-[#FF3B2F] [text-shadow:2px_2px_0_#2B0B0B]`}
        >
          {title}
        </h3>

        <input
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          placeholder="4–6 digit PIN"
          aria-label="PIN"
          className="mt-6 w-full rounded-xl border-4 border-[#2B0B0B] bg-[#FFF3C4] px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none transition placeholder:text-base placeholder:font-medium placeholder:tracking-normal placeholder:text-[#2B0B0B]/45 focus:bg-white focus:ring-4 focus:ring-[#FF3B2F]/40"
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border-4 border-[#2B0B0B] bg-white px-5 py-2 text-sm font-bold shadow-[3px_3px_0_#2B0B0B] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_#2B0B0B]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pin.length < 4 || busy}
            className="rounded-full border-4 border-[#2B0B0B] bg-[#FF3B2F] px-5 py-2 text-sm font-bold text-white shadow-[3px_3px_0_#2B0B0B] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_#2B0B0B] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_#2B0B0B]"
          >
            {busy ? "..." : "Confirm"}
          </button>
        </div>
      </form>
    </div>
  );
}