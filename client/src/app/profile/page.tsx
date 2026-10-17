"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import Avatar from "@/components/Avatar";
import {
  ErrorBox,
  Logo,
  Mascot,
  SuccessBox,
  ThemeStyles,
  body,
  display,
  inputCls,
  labelCls,
  pageBg,
  primaryBtn,
} from "@/components/EnChatTheme";

type Me = {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  has_pin: boolean;
};

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<{ user: Me }>("/api/user/me")
      .then((d) => {
        setMe(d.user);
        setDisplayName(d.user.display_name ?? "");
        setAvatarUrl(d.user.avatar_url ?? "");
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  async function save() {
    setError("");
    setStatus("");
    try {
      const d = await apiRequest<{ user: Me }>("/api/user/me", {
        method: "PATCH",
        body: {
          display_name: displayName || null,
          avatar_url: avatarUrl || null,
        },
      });
      setMe(d.user);
      setStatus("Saved!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  if (!me) {
    return (
      <main
        className={`${body.className} flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FFF3C4] text-[#2B0B0B]`}
        style={pageBg}
      >
        <ThemeStyles />
        <Mascot className="wobble w-28" />
        <p
          className={`${display.className} text-4xl tracking-wide text-[#FF3B2F] [text-shadow:2px_2px_0_#2B0B0B]`}
        >
          Loading profile...
        </p>
      </main>
    );
  }

  const label = me.display_name || me.username;

  return (
    <main
      className={`${body.className} min-h-screen bg-[#FFF3C4] p-5 text-[#2B0B0B] sm:p-6`}
      style={pageBg}
    >
      <ThemeStyles />

      <div className="mx-auto max-w-md">
        <div className="mb-8 flex items-center justify-between gap-3">
          <button
            onClick={() => router.push("/chat")}
            className="rounded-full border-4 border-[#2B0B0B] bg-white px-4 py-2 text-sm font-bold shadow-[3px_3px_0_#2B0B0B] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_#2B0B0B]"
          >
            ← Back to chats
          </button>
          <Logo />
        </div>

        <div className="rounded-3xl border-4 border-[#2B0B0B] bg-white p-6 shadow-[10px_10px_0_#2B0B0B]">
          <div className="flex items-center gap-4">
            <Avatar name={label} src={avatarUrl || me.avatar_url} size={64} />
            <div className="min-w-0">
              <h1
                className={`${display.className} truncate text-4xl leading-none tracking-wide text-[#FF3B2F] [text-shadow:2px_2px_0_#2B0B0B]`}
              >
                {label}
              </h1>
              <p className="mt-2 inline-block max-w-full -rotate-2 truncate rounded-full border-2 border-[#2B0B0B] bg-[#FFD93B] px-3 py-0.5 text-sm font-bold">
                @{me.username}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <label htmlFor="display-name" className={labelCls}>
                Display name
              </label>
              <input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value.slice(0, 40))}
                placeholder={me.username}
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="avatar-url" className={labelCls}>
                Avatar image URL
              </label>
              <input
                id="avatar-url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className={inputCls}
              />
              <p className="mt-2 text-sm font-medium text-[#2B0B0B]/70">
                Paste any image URL. It will appear as your profile picture.
              </p>
            </div>

            <button onClick={() => void save()} className={primaryBtn}>
              Save changes <span aria-hidden="true">✨</span>
            </button>

            {status && <SuccessBox>{status}</SuccessBox>}
            {error && <ErrorBox>{error}</ErrorBox>}

            <div className="rounded-2xl border-4 border-dashed border-[#2B0B0B] bg-[#FFF3C4] p-4">
              <p className="flex flex-wrap items-center gap-2 font-bold">
                <span aria-hidden="true">🔒</span> Hidden chats PIN:
                <span
                  className={`rounded-full border-2 border-[#2B0B0B] px-3 py-0.5 text-sm ${
                    me.has_pin
                      ? "bg-[#FFD93B]"
                      : "bg-[#FF3B2F] text-white"
                  }`}
                >
                  {me.has_pin ? "set" : "not set"}
                </span>
              </p>
              <p className="mt-2 text-sm font-medium text-[#2B0B0B]/70">
                You will set or change your PIN the first time you hide a chat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}