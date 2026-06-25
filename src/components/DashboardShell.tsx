"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  LogOut,
  FolderKanban,
  Menu,
  X,
  UserCircle2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logoutRoutine } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationLinks = [
    { name: "Workspace Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Project Boards", href: "/dashboard/projects", icon: FolderKanban },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#090D16]">
      {/* =========================================================================
          DESKTOP SIDEBAR: Permanent column fixed to left margin on lg screens
         ========================================================================= */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-800/80 p-5 justify-between"
        style={{ backgroundColor: "var(--color-brand-surface)" }}
      >
        <div className="space-y-8">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white shadow-glow">
              TS
            </div>
            <span className="font-bold text-lg text-white tracking-wide">
              TeamSync{" "}
              <span className="text-xs font-medium text-indigo-400">Core</span>
            </span>
          </div>

          {/* Navigation Link Stack */}
          <nav className="space-y-1.5">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: "var(--color-brand-accent)" }
                      : undefined
                  }
                >
                  <Icon
                    size={18}
                    className={
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-indigo-400 transition-colors"
                    }
                  />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Node Profile Meta Card */}
        <div className="border-t border-slate-800/80 pt-4 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <UserCircle2 size={36} className="text-slate-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || "Anonymous User"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck size={12} className="text-indigo-400" />
                <span className="text-xs text-slate-400 font-mono tracking-wider">
                  {user?.role || "MEMBER"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={logoutRoutine}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 border border-transparent hover:border-red-900/30 transition-all cursor-pointer"
          >
            <LogOut size={18} />
            Wipe Node Session
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MOBILE APP BAR LAYER: Adaptive viewports tracking touch dimensions
         ========================================================================= */}
      <header
        className="md:hidden flex items-center justify-between px-5 py-4 border-b border-slate-800/80"
        style={{ backgroundColor: "var(--color-brand-surface)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-glow">
            TS
          </div>
          <span className="font-bold text-white tracking-wide text-md">
            TeamSync
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Floating Drawer Overlay for Mobile viewports */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-x-0 top-[61px] z-50 border-b border-slate-800 flex flex-col p-5 space-y-6 animate-fade-in shadow-2xl"
          style={{ backgroundColor: "var(--color-brand-surface)" }}
        >
          <nav className="flex flex-col gap-2">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-200"
                  style={
                    isActive
                      ? { backgroundColor: "var(--color-brand-accent)" }
                      : undefined
                  }
                >
                  <Icon size={18} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <UserCircle2 size={32} className="text-slate-400" />
              <div>
                <p className="text-xs font-semibold text-white">{user?.name}</p>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider">
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logoutRoutine();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 border border-red-900/40 rounded-lg bg-red-950/20"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          DYNAMIC SCREEN INJECTION CONTAINER VIEWPORT
         ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
