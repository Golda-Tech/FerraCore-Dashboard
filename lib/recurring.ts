"use client";
import api from "./api";
import type {
  RecurringPaymentSubscriptionRequest,
  RecurringPaymentSubscriptionResponse,
  AuthorizeOtpRequest,
  AuthorizeOtpResponse,
  FirstInstallmentPaymentRequest,
  FirstInstallmentPaymentResponse,
  RecurringPaymentStatusResponse,
} from "@/types/recurring";

const RECURRING_BASE = "/api/v1/recurring-payments";

/** Create a recurring payment subscription (mandate) */
export async function createSubscription(
  data: RecurringPaymentSubscriptionRequest
): Promise<RecurringPaymentSubscriptionResponse> {
  const response = await api.post<RecurringPaymentSubscriptionResponse>(
    `${RECURRING_BASE}/subscription`,
    data
  );
  return response.data;
}

/** Authorize subscription with OTP */
export async function authorizeOtp(
  data: AuthorizeOtpRequest
): Promise<AuthorizeOtpResponse> {
  const response = await api.post<AuthorizeOtpResponse>(
    `${RECURRING_BASE}/authorize-otp`,
    data
  );
  return response.data;
}

/** Resend OTP for a subscription */
export async function resendOtp(
  subscriptionId: string
): Promise<RecurringPaymentSubscriptionResponse> {
  const response = await api.post<RecurringPaymentSubscriptionResponse>(
    `${RECURRING_BASE}/${subscriptionId}/resend-otp`,
    {}
  );
  return response.data;
}

/** Request first installment payment */
export async function requestFirstPayment(
  data: FirstInstallmentPaymentRequest
): Promise<FirstInstallmentPaymentResponse> {
  const response = await api.post<FirstInstallmentPaymentResponse>(
    `${RECURRING_BASE}/installment/request-first-payment`,
    data
  );
  return response.data;
}

/** Fetch all recurring payment subscriptions for a user */
export async function getSubscriptions(
    userEmail: string
): Promise<RecurringPaymentSubscriptionResponse[]> {
  const response = await api.get<RecurringPaymentSubscriptionResponse[]>(
    `${RECURRING_BASE}/subscriptions`,
    { params: { userEmail } }
  );
  return response.data;
}

/** Fetch a single subscription by ID */
export async function getSubscription(
  subscriptionId: string
): Promise<RecurringPaymentSubscriptionResponse> {
  const response = await api.get<RecurringPaymentSubscriptionResponse>(
    `${RECURRING_BASE}/subscriptions/${subscriptionId}`
  );
  return response.data;
}

/** Get subscription status (profile + transactions) */
export async function getSubscriptionStatus(
  subscriptionId: string
): Promise<RecurringPaymentStatusResponse> {
  const response = await api.get<RecurringPaymentStatusResponse>(
    `${RECURRING_BASE}/${subscriptionId}/status`
  );
  return response.data;
}

