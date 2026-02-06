"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      setLoading(false);

      if (data?.success) {
        toast.success("If this email exists, a reset link was sent.");
        router.replace("/sign-in");
      } else {
        toast.error(data?.message || "Something went wrong.");
      }
    } catch {
      setLoading(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Forgot your password?
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Enter your email and we’ll send you a link to reset your password.
          </p>
        </div>

        {/* Email input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">
            Email address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 flex items-center justify-center gap-2 w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {loading && <LoaderCircle size={18} className="animate-spin" />}
          Send reset link
        </button>

        {/* Footer hint */}
        <p className="mt-6 text-center text-xs text-neutral-500">
          Remembered your password?{" "}
          <span
            onClick={() => router.push("/sign-in")}
            className="cursor-pointer underline underline-offset-2 hover:text-neutral-700"
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgetPassword;
