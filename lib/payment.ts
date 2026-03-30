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
  OptimizedPaymentsQuery,
  OptimizedPaymentsResponse,
  StreamPaymentItem,
  PartnerTotalResponse,
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

export async function getOptimizedPayments(
  query: OptimizedPaymentsQuery
): Promise<OptimizedPaymentsResponse> {
  const { signal } = query;
  const params: Record<string, string | number> = {
    page: query.page ?? 0,
    size: query.size ?? 20,
    sort: query.sort ?? "initiatedAt,desc",
  };

  if (query.q) params.q = query.q;
  if (query.statuses?.length) params.statuses = query.statuses.join(",");
  if (query.startDate) params.startDate = query.startDate;
  if (query.endDate) params.endDate = query.endDate;
  if (query.initiatedBy) params.initiatedBy = query.initiatedBy;

  const response = await api.get<OptimizedPaymentsResponse>("/api/v1/payments/optimized", {
    params,
    signal,
  });
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
export async function getUserInfo(mobileNumber: string, provider?: string): Promise<UserInfo> {
  const response = await api.get<UserInfo>("/api/v1/payments/name-enquiry", {
    params: { mobileNumber, provider },
  });
  return response.data;
}

//fetch commission fees with partnerId as request parameter and transactionFee, recurringFee and cappedAmount as response parameters
export async function getCommissionFees(partnerName: string): Promise<{ transactionFee: string; cappedAmount: string; recurringFee: string }> {
  const response = await api.get<{ transactionFee: string; cappedAmount: string; recurringFee: string }>(
    "/api/v1/payments/fees",
    {
      params: { partnerName },
    }
  );
  return response.data;
}

// Update commission fees for a partner
export async function updateCommissionFees(
  partnerName: string,
  fees: { transactionFee: string; cappedAmount: string; recurringFee: string }
): Promise<{ transactionFee: string; cappedAmount: string; recurringFee: string }> {
  const response = await api.put<{ transactionFee: string; cappedAmount: string; recurringFee: string }>(
    "/api/v1/payments/fees",
    fees,
    { params: { partnerName } }
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

/**
 * Single API call for export. Returns whatever the server gives back
 * (up to 100 items). The items array is used to build the CSV/PDF.
 */
export async function getExportPayments(
  query: OptimizedPaymentsQuery
): Promise<OptimizedPaymentsResponse> {
  return getOptimizedPayments({
    ...query,
    page: 0,
    size: 100,
  });
}

/**
 * Fetch all payments for a date range via the stream endpoint.
 * Returns the full array of items for that range — used for PDF/CSV export.
 */
export async function getStreamPayments(
  startDate: string,
  endDate: string,
  signal?: AbortSignal
): Promise<StreamPaymentItem[]> {
  const response = await api.get<StreamPaymentItem[]>(
    "/api/v1/payments/optimized/stream",
    {
      params: { startDate, endDate },
      signal,
    }
  );
  return response.data;
}

/**
 * Get partner total amount for a date range.
 * POST /api/v1/payments/optimized/partner-total
 */
export async function getPartnerTotal(
  initiatedBy: string,
  startDate: string,
  endDate: string,
  signal?: AbortSignal
): Promise<PartnerTotalResponse> {
  const response = await api.post<PartnerTotalResponse>(
    "/api/v1/payments/optimized/partner-total",
    { initiatedBy, startDate, endDate },
    { signal }
  );
  return response.data;
}
