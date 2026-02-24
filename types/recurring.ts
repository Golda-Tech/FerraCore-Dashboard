export enum RecurringPaymentStatus {
  CREATED = "CREATED",
  PENDING_AUTH = "PENDING_AUTH",
  ACTIVE = "ACTIVE",
  FIRST_PAYMENT_PENDING = "FIRST_PAYMENT_PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  IN_GRACE = "IN_GRACE",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface RecurringPaymentSubscriptionRequest {
  customerNumber: string;
  customerName: string;
  amount: number;
  cycle: "DLY" | "WKL" | "MON";
  startDate: string;
  endDate: string;
  networkProvider: "AIR" | "VOD" | "MTN";
  reference: string;
  returnUrl: string;
  resumable: "Y" | "N";
  cycleSkip: "Y" | "N";
}

export interface RecurringPaymentSubscriptionResponse {
  subscriptionId: string;
  customerNumber: string;
  customerName: string;
  amount: number;
  cycle: string;
  startDate: string;
  endDate: string;
  status: RecurringPaymentStatus;
  mandateReference: string;
  authorizationTimestamp: string;
  outstandingBalance: number;
  networkProvider: string;
  message: string;
}

export interface AuthorizeOtpRequest {
  subscriptionId: string;
  authCode: string;
}

export interface AuthorizeOtpResponse {
  subscriptionId: string;
  status: RecurringPaymentStatus;
  mandateReference: string;
  authorizationTimestamp: string;
  message: string;
}

export interface FirstInstallmentPaymentRequest {
  subscriptionId: string;
  amount: number;
  invoiceId: string;
  reference: string;
}

export interface FirstInstallmentPaymentResponse {
  paymentId: string;
  subscriptionId: string;
  exttrid: string;
  amount: number;
  status: string;
  message: string;
  responseCode: string;
  responseDescription: string;
}

