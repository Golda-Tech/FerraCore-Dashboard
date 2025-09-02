"use client";
import api from "./api";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@/types/auth";
import { redirect } from "next/navigation";

const TOKEN_KEY = "token";

export function isAuthenticated(): boolean {
  if (typeof window !== "undefined") {
    return !!localStorage.getItem(TOKEN_KEY);
  }
  return false;
}

export async function login({ email, password }: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/api/v1/auth/login", { email, password });
  if (response.data.token) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
  }
  return response.data;
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>("/api/v1/auth/register", data);
  if (response.data.token) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
  }
  return response.data;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    redirect("/login");
  }
}