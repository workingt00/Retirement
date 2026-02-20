"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useWizard } from "../store";

export default function StepSignup() {
  const { goBack } = useWizard();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = email.includes("@") && password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: email.split("@")[0],
          mode: "horizon",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Redirect to dashboard on success
      window.location.href = "/dashboard";
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-6">
      <motion.h2
        className="mb-2 text-center text-2xl font-bold text-white md:text-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Create your account
      </motion.h2>
      <motion.p
        className="mb-6 text-center text-sm text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Save your projection and unlock the full planning experience
      </motion.p>

      <motion.form
        className="w-full max-w-md space-y-4"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
      >
        {/* Email */}
        <div>
          <label
            htmlFor="signup-email"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400"
          >
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-xl border border-gray-700 bg-gray-800/60 px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="signup-password"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400"
          >
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            className="w-full rounded-xl border border-gray-700 bg-gray-800/60 px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30"
          />
        </div>

        {/* Error */}
        {error && (
          <motion.p
            className="text-center text-sm text-red-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={!isValid || loading}
          className="w-full rounded-xl bg-amber-500 px-8 py-3 font-semibold text-gray-900 transition-colors hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500"
          whileHover={isValid && !loading ? { scale: 1.02 } : undefined}
          whileTap={isValid && !loading ? { scale: 0.98 } : undefined}
          style={{ minHeight: "48px" }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  className="opacity-75"
                />
              </svg>
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </motion.button>
      </motion.form>

      {/* Login link */}
      <motion.p
        className="mt-4 text-center text-sm text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Already registered?{" "}
        <Link
          href="/login"
          className="font-medium text-amber-400 hover:text-amber-300 transition-colors"
        >
          Login here
        </Link>
      </motion.p>

      {/* Back */}
      <motion.button
        className="mt-6 text-sm text-gray-500 hover:text-gray-300"
        onClick={goBack}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Go back
      </motion.button>
    </div>
  );
}
