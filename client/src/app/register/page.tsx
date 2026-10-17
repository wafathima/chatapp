"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import {
  AuthShell,
  ErrorBox,
  inputCls,
  labelCls,
  primaryBtn,
} from "@/components/EnChatTheme";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: { username, email, password },
      });

      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Join the chaos!"
      subtitle="Join your people and start chatting."
      bubble="New friend! 🎉"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-[#FF3B2F] underline decoration-4 underline-offset-4 hover:text-[#2B0B0B]"
          >
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className={labelCls}>
            Username
          </label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            maxLength={30}
            pattern="[A-Za-z0-9_]+"
            autoComplete="username"
            required
            className={inputCls}
            placeholder="your_username"
          />
        </div>

        <div>
          <label htmlFor="email" className={labelCls}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className={inputCls}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className={labelCls}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            required
            className={inputCls}
            placeholder="At least 8 characters"
          />
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}

        <button type="submit" disabled={loading} className={primaryBtn}>
          {loading ? "Creating account..." : "Create account"}{" "}
          <span aria-hidden="true">💥</span>
        </button>
      </form>
    </AuthShell>
  );
}