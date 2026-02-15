"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) router.replace("/");
  }, [token, router]);

  async function handleSubmit() {
    if (!password) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setMessage(data.message || "Invalid or expired reset link.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">Reset your password</h1>
          <p className="mt-2 text-sm text-zinc-500">Enter a new password for your account</p>
        </div>

        {status === "success" ? (
          <div className="text-center">
            <p className="text-green-600 font-medium">Your password has been updated.</p>
            <p className="mt-2 text-sm text-zinc-500">You can now sign in with your new password.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <p className="text-xs text-zinc-500">
                Use at least 8 characters, including letters and numbers.
              </p>
            </div>

            {status === "error" && <p className="mt-4 text-sm text-red-600">{message}</p>}

            <button
              onClick={handleSubmit}
              disabled={status === "loading"}
              className="mt-6 w-full rounded-lg bg-black py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {status === "loading" ? "Updating…" : "Reset password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
