"use client";
import api from "./api";
import {
  Payment,
  CreatePaymentRequest,
  CreatePaymentResponse,
  TransactionStatus,
  UserInfo,
} from "@/types/payment";

// Create a new payment
export async function createPayment(
  data: CreatePaymentRequest
): Promise<CreatePaymentResponse> {
  const response = await api.post<CreatePaymentResponse>("/api/v1/payments", data);
  return response.data;
}

// Fetch all payments, optional pagination
export async function getPayments(
  page: number = 0,
  size: number = 20
): Promise<Payment[]> {
  const params = { page, size };
  const response = await api.get<Payment[]>("/api/v1/payments", { params });
  return response.data;
}

// Fetch a single payment by transactionRef
export async function getPayment(transactionRef: string): Promise<Payment> {
  const response = await api.get<Payment>(`/api/v1/payments/${transactionRef}`);
  return response.data;
}

// Check status of a transaction
export async function getTransactionStatus(
  provider: string,
  transactionRef: string
): Promise<TransactionStatus> {
  const response = await api.get<TransactionStatus>("/api/v1/payments/status", {
    params: { provider, transactionRef },
  });
  return response.data;
}

// Perform name enquiry (get user info by mobile number)
export async function getUserInfo(mobileNumber: string): Promise<UserInfo> {
  const response = await api.get<UserInfo>("/api/v1/payments/name-enquiry", {
    params: { mobileNumber },
  });
  return response.data;
}
