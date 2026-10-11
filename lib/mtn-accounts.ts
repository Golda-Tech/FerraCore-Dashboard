"use client";
import api from "./api";

// Admin-only (SUPER_ADMIN / GA_ADMIN) MTN account routing.
// See "Auth Service — Admin: MTN Account Routing" in the Postman collection.

export const DEFAULT_MTN_ACCOUNT = "DEFAULT";

export interface MtnAccountResponse {
  organizationId: string;
  organizationName: string;
  accountCode: string;
  previousAccountCode: string;
  updatedAt: string;
}

export async function listMtnAccounts(): Promise<string[]> {
  const { data } = await api.get<string[]>(
    "/api/v1/subscriptions/admin/mtn-accounts"
  );
  return data;
}

export async function getPartnerMtnAccount(
  organizationId: string
): Promise<MtnAccountResponse> {
  const { data } = await api.get<MtnAccountResponse>(
    `/api/v1/subscriptions/admin/${encodeURIComponent(organizationId)}/mtn-account`
  );
  return data;
}

export async function switchPartnerMtnAccount(
  organizationId: string,
  accountCode: string
): Promise<MtnAccountResponse> {
  const { data } = await api.put<MtnAccountResponse>(
    `/api/v1/subscriptions/admin/${encodeURIComponent(organizationId)}/mtn-account`,
    { accountCode }
  );
  return data;
}

export function resetPartnerMtnAccount(organizationId: string) {
  return switchPartnerMtnAccount(organizationId, DEFAULT_MTN_ACCOUNT);
}

export function mtnErrorMessage(err: any, fallback: string): string {
  const status = err?.response?.status;
  if (status === 403) return "Only SUPER_ADMIN or GA_ADMIN can manage MTN accounts.";
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}
