"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";
import { LogIn, ShieldAlert, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { loginRoutine } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Validation & Loading States
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Client-side Guard Validation
    if (!email || !password) {
      setErrorMessage("Please fill out all fields before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { accessToken, user } = response.data;

      // Pass token payload straight to our Global session context
      loginRoutine(accessToken, user);
    } catch (error: any) {
      const serverMessage =
        error.response?.data?.message ||
        "Invalid credentials or connection timeout.";
      setErrorMessage(
        Array.isArray(serverMessage) ? serverMessage[0] : serverMessage,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#090D16]">
      <div
        className="w-full max-w-md p-8 rounded-2xl border border-slate-800 shadow-xl transition-all duration-300"
        style={{ backgroundColor: "var(--color-brand-surface)" }}
      >
        {/* Branding Title Block */}
        <div className="text-center mb-8">
          <div
            className="inline-flex p-3 rounded-xl mb-3"
            style={{ backgroundColor: "rgba(99, 102, 241, 0.1)" }}
          >
            <LogIn size={28} style={{ color: "var(--color-brand-accent)" }} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Access your enterprise workspace
          </p>
        </div>

        {/* Dynamic Exception Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-900/50 flex items-start gap-3 text-red-400 text-sm">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Input Form Fields */}
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Corporate Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mahesh@teamsync.local"
              className="w-full px-4 py-3 rounded-xl bg-[#090D16] border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Account Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-[#090D16] border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--color-brand-accent)" }}
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Alternate Routing Footer */}
        <div className="mt-6 text-center text-sm text-slate-400">
          New to the system?{" "}
          <Link
            href="/register"
            className="font-semibold hover:underline"
            style={{ color: "var(--color-brand-accent)" }}
          >
            Register User
          </Link>
        </div>
      </div>
    </main>
  );
}
