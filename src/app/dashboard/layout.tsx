"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/DashboardShell";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Session Shield Guard: Kick unauthenticated sessions straight out to login screen
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen w-full bg-[#090D16] flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="text-indigo-500 animate-spin" />
        <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">
          Validating Authentication Token Node
        </p>
      </div>
    );
  }

  // Inject child viewports inside our responsive shell frame
  return <DashboardShell>{children}</DashboardShell>;
}
