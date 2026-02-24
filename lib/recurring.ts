"use client";
import api from "./api";
import type {
  RecurringPaymentSubscriptionRequest,
  RecurringPaymentSubscriptionResponse,
  AuthorizeOtpRequest,
  AuthorizeOtpResponse,
  FirstInstallmentPaymentRequest,
  FirstInstallmentPaymentResponse,
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

