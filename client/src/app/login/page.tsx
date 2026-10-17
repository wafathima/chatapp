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

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiRequest("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back!"
      subtitle="Log in to continue your conversations."
      bubble="Missed ya! 👋"
      footer={
        <>
          Do not have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-[#FF3B2F] underline decoration-4 underline-offset-4 hover:text-[#2B0B0B]"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
            autoComplete="current-password"
            required
            className={inputCls}
            placeholder="Your password"
          />
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}

        <button type="submit" disabled={loading} className={primaryBtn}>
          {loading ? "Logging in..." : "Log in"}{" "}
          <span aria-hidden="true">🚀</span>
        </button>
      </form>
    </AuthShell>
  );
}