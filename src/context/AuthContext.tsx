"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../utils/api";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginRoutine: (accessToken: string, user: UserProfile) => void;
  logoutRoutine: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // On mount, restore session states from browser local storage cached records
    if (typeof window !== "undefined") {
      const cachedUser = localStorage.getItem("userProfile");
      const token = localStorage.getItem("accessToken");

      if (cachedUser && token) {
        setUser(JSON.parse(cachedUser));
      }
      setIsLoading(false);
    }
  }, []);

  const loginRoutine = (accessToken: string, userProfile: UserProfile) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("userProfile", JSON.stringify(userProfile));

    setUser(userProfile);
    router.push("/dashboard");
  };

  const logoutRoutine = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userProfile");

    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginRoutine,
        logoutRoutine,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth must be executed within an AuthProvider component tree wrapper",
    );
  }
  return context;
}
