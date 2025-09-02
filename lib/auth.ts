"use client";

import { redirect } from "next/navigation";
import { AuthResponse } from "@/types/auth";

const AUTH_KEY = "auth";

export function getAuth(): AuthResponse | null {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
}

export function isAuthenticated(): boolean {
  return !!getAuth();
}

export function saveAuth(user: AuthResponse): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
  redirect("/login");
}
