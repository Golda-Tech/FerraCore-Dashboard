"use client";
import { redirect } from "next/navigation";

const AUTH_KEY = "isAuthenticated";

export function isAuthenticated(): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem(AUTH_KEY) === "true";
  }
  return false;
}

export function login(password: string): boolean {
  if (password.length > 0) {
    localStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
  redirect("/login");
}
