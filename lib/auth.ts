"use client";
import api from "./api";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "@/types/auth";
import { redirect } from "next/navigation";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function isAuthenticated(): boolean {
  if (typeof window !== "undefined") {
    return !!localStorage.getItem(TOKEN_KEY);
  }
  return false;
}

export async function login({
  email,
  password,
}: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/api/v1/auth/login", {
    email,
    password,
  });
  if (response.data.token) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data));
  }
  return response.data;
}

export async function register(
  data: RegisterRequest
): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>(
    "/api/v1/auth/register",
    data
  );
  if (response.data.token) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data));
  }
  return response.data;
}

//{{baseURL}}/api/v1/auth/send-login-otp?destination=jonamarkin@gmail.com&channel=EMAIL&type=LOGIN
export async function sendLoginOtp(
  destination: string,
  password: string,
  channel: string,
  type: string
): Promise<{ message: string }> {
  const response = await api.get<{ message: string }>(
    "/api/v1/auth/send-login-otp",
    {
      params: { destination, password, channel, type },
    }
  );
  return response.data;
}

export async function resetPassword(
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  const response = await api.post<ResetPasswordResponse>(
    "/api/v1/auth/reset-password",
    data
  );
  return response.data;
}


//{{baseURL}}/api/v1/auth/verify-otp?identifier=jonamarkin@gmail.com&channel=EMAIL&otp=525262
export async function verifyLoginOtp(
  identifier: string,
  channel: string,
  otp: string
): Promise<LoginResponse> {
  const response = await api.get<LoginResponse>("/api/v1/auth/verify-otp", {
    params: { identifier, channel, otp },
  });
  if (response.data.token) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data));
  }
  return response.data;
}

export function getUser(): LoginResponse | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? (JSON.parse(stored) as LoginResponse) : null;
  }
  return null;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY); // ✅ clear user
    redirect("/login");
  }
}
