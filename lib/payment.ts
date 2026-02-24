"use client";
import api from "./api";
import {
  Payment,
  CreatePaymentRequest,
  CreatePaymentResponse,
  TransactionStatus,
  UserInfo,
  StatusSummary,
  PaymentTrend,
} from "@/types/payment";

// Create a new payment
export async function createPayment(
  data: CreatePaymentRequest,
  headers?: {
    "X-Callback-Url"?: string;
    "X-Reference-Id"?: string;
    "X-Target-Environment"?: string;
  }
): Promise<CreatePaymentResponse> {
  const response = await api.post<CreatePaymentResponse>(
    "/api/v1/payments",
    data,
    { headers }
  );
  return response.data;
}

// Fetch all payments, optional pagination
export async function getPayments(
  initiatedBy?: string,
  page: number = 0,
  size: number = 20
): Promise<Payment[]> {
  const params: any = {};
  if (initiatedBy !== undefined) params.initiatedBy = initiatedBy;

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

//fetch commission fees with partnerId as request parameter and transactionFee and cappedAmount as response parameters
export async function getCommissionFees(partnerName: string): Promise<{ transactionFee: string; cappedAmount: string }> {
  const response = await api.get<{ transactionFee: string; cappedAmount: string }>(
    "/api/v1/payments/fees",
    {
      params: { partnerName },
    }
  );
  return response.data;
}



export async function sendOtp(
  destination: string,
  channel: string,
  type: string
): Promise<{ message: string }> {
  const response = await api.get<{ message: string }>(
    "/api/v1/payments/send-otp",
    {
      params: { destination, channel, type },
    }
  );
  return response.data;
}

export async function verifyOtp(
  identifier: string,
  channel: string,
  otp: string
): Promise<{ message: string }> {
  const response = await api.get<{ message: string }>(
    "/api/v1/payments/verify-otp",
    {
      params: { identifier, channel, otp },
    }
  );
  return response.data;
}


// Get ALL payments status summary OR filtered by initiatedBy
export async function getPaymentsStatusSummary(initiatedBy?: string): Promise<StatusSummary> {
  const url = initiatedBy
    ? `/api/v1/payments/status-summary?initiatedBy=${encodeURIComponent(initiatedBy)}`
    : "/api/v1/payments/status-summary";

  const { data } = await api.get<StatusSummary>(url);
  console.log("Payments Status Summary:", data); // Debug log
  return data;
}

// Fetch payments trends
export async function getPaymentsTrends(
    startDate: string,
  endDate: string,
  interval: "DAILY" | "WEEKLY" | "MONTHLY" = "DAILY",
    initiatedBy?: string
): Promise<PaymentTrend[]> {
  const response = await api.get<PaymentTrend[]>("/api/v1/payments/trends", {
    params: { initiatedBy, startDate, endDate, interval },
  });
  return response.data;
}