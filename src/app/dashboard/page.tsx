"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Activity, Shield } from "lucide-react";

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* View Header block */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Enterprise Node Center
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Cross-origin activity monitoring feeds
        </p>
      </div>

      {/* Grid Summary Indicator Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-brand-surface to-slate-900/60 shadow-card flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Activity size={22} />
          </div>
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-slate-500">
              System Link Connection
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              Active Communication Loop
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Axios instance interceptor mapped safely to NestJS context ports.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-brand-surface to-slate-900/60 shadow-card flex items-start gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Shield size={22} />
          </div>
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-slate-500">
              RBAC Token Scope Clearance
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              {user?.role || "MEMBER"} Privilege Node
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Declared security metadata parameters validated within local
              session contexts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
