"use client";
import api from "./api";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  RegisterUserRequest,
  WhitelistUpdateRequest,
  ProfileResponse,
  ResetPasswordResponse,
} from "@/types/auth";


const TOKEN_KEY = "token";
const USER_KEY = "user";

export function isAuthenticated(): boolean {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log("isAuthenticated check:", !!token); // Debug log
    return !!token;
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


export async function getUserProfile(): Promise<ProfileResponse> {
  const { data } = await api.get<ProfileResponse>("/api/v1/auth/profile");
  return data;
}

export async function fetchNewKeys(): Promise<ProfileResponse> {
  const { data } = await api.post<ProfileResponse>(
          "/api/v1/auth/profile/regenerate-credentials"
        );
  return data;
}


export async function updateProfile(data: Partial<ProfileResponse>) {
  const { data: updated } = await api.put<ProfileResponse>("/api/v1/auth/profile", data);
  return updated;
}

export async function updateOrganization(data: Partial<ProfileResponse["organization"]>) {
  const { data: updated } = await api.put<ProfileResponse>("/api/v1/auth/profile/organization", data);
  return updated;
}

export async function updateCallbackUrl(callbackUrl: string) {
  const { data: updated } = await api.put<ProfileResponse>("/api/v1/auth/profile/callback", { callbackUrl });
  return updated;
}



export async function register(
  data: RegisterRequest
): Promise<RegisterResponse> {
  // Clear any existing auth data BEFORE making the request
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    console.log("Cleared auth data before registration"); // Debug log
  }
  
  const response = await api.post<RegisterResponse>(
    "/api/v1/auth/register",
    data
  );

  // Double-check it's cleared after registration
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    console.log("Cleared auth data after registration"); // Debug log
  }

  return response.data;
}

// Clear authentication - exported so it can be used elsewhere
export function clearAuth(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    console.log("Auth cleared"); // Debug log
  }
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

export async function updateWhitelistedNumbers(
  dto: WhitelistUpdateRequest
): Promise<ProfileResponse> {
  const { data } = await api.put<ProfileResponse>(
    "/api/v1/auth/profile/whitelistIds",
    dto
  );
  return data;
}

export async function forgotPassword(
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  const response = await api.post<ResetPasswordResponse>(
    "/api/v1/auth/forgot-password",
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
  // Only set token if password reset is not required
  if (response.data.token && !response.data.passwordResetRequired) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.data));
  }
  return response.data;
}


export async function sendResetOtp(
  destination: string,
  channel: string,
  type: string
): Promise<{ message: string }> {
  const response = await api.get<{ message: string }>(
    "/api/v1/auth/send-reset-otp",
    {
      params: { destination, channel, type },
    }
  );
  return response.data;
}


export async function verifyResetOtp(
  identifier: string,
  channel: string,
  otp: string
): Promise<{ message: string }> {
  const response = await api.get<{ message: string }>(
    "/api/v1/auth/verify-reset-otp",
    {
      params: { identifier, channel, otp },
    }
  );
  return response.data;
}

export async function registerUser(data: RegisterUserRequest) {
  const response = await api.post("/api/v1/auth/create/user", data);
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
  clearAuth();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}