"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { UserPlus, CheckCircle, ShieldAlert, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("MEMBER");

  // Status Handlers
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name || !email || !password) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/auth/register", { name, email, password, role });
      setIsSuccess(true);

      // Forward the user to the login terminal after a brief success window
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      const serverMessage =
        error.response?.data?.message || "Failed to initialize account matrix.";
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
        {/* Registration Title Block */}
        <div className="text-center mb-8">
          <div
            className="inline-flex p-3 rounded-xl mb-3"
            style={{ backgroundColor: "rgba(99, 102, 241, 0.1)" }}
          >
            <UserPlus
              size={28}
              style={{ color: "var(--color-brand-accent)" }}
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Create Workspace
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Establish your system credentials
          </p>
        </div>

        {/* Success Feedback Screen Overlay */}
        {isSuccess ? (
          <div className="text-center py-8 space-y-3">
            <div className="flex justify-center text-status-done">
              <CheckCircle
                size={48}
                style={{ color: "var(--color-status-done)" }}
              />
            </div>
            <h2 className="text-lg font-bold text-white">
              Registration Complete!
            </h2>
            <p className="text-sm text-slate-400">
              Syncing database assets... routing to terminal.
            </p>
          </div>
        ) : (
          <>
            {/* Dynamic Error Exception Banner */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-900/50 flex items-start gap-3 text-red-400 text-sm">
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Display Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mahesh Kulathunga"
                  className="w-full px-4 py-3 rounded-xl bg-[#090D16] border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  System Email
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
                  Security Password (Min 6 chars)
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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Assigned Platform Role Clearance
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#090D16] border border-slate-700 text-slate-300 focus:outline-none focus:border-indigo-500 text-sm transition-colors cursor-pointer"
                >
                  <option value="MEMBER">
                    MEMBER (View Tasks & Contribute Comments)
                  </option>
                  <option value="MANAGER">
                    MANAGER (Full Workspace Board & Project Creation Authority)
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50"
                style={{ backgroundColor: "var(--color-brand-accent)" }}
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Register"
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              Already have an active key?{" "}
              <Link
                href="/login"
                className="font-semibold hover:underline"
                style={{ color: "var(--color-brand-accent)" }}
              >
                Return to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
