"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Login failed.");
      }
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-ivory p-8 shadow-card"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-navy/10">
          <Lock size={22} className="text-navy" />
        </div>
        <h1 className="mb-1 text-center font-serif text-lg font-semibold text-navy">
          Admin sign in
        </h1>
        <p className="mb-6 text-center text-xs text-ink/60">
          P.C.E.A. Embakasi Media Fund dashboard
        </p>

        <label className="mb-1 block text-xs font-medium text-ink/70" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3 w-full rounded-md border border-ink/15 px-3 py-2.5 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
          required
        />

        {error && (
          <p className="mb-3 rounded-md bg-maroon/10 px-3 py-2 text-xs font-medium text-maroon">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
