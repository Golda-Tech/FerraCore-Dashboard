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
  createdBy: string;
  partnerId: string;
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

export interface ProfileDto {
  amount: string;
  callbackUrl: string;
  cancelDate: string;
  completed: boolean;
  customerNumber: string;
  cycle: string;
  cycleSkip: string;
  endDate: string;
  nw: string;
  resumable: string;
  serviceId: string;
  serviceName: string;
  startDate: string;
  status: string;
  subscriptionDate: string;
  uniqRefId: string;
}

export interface TransactionDto {
  prevSchedule: string;
  processingId: string;
  transDate: string;
  transId: string;
  transMsg: string;
  transRef: string;
  transStatus: string;
}

export interface RecurringPaymentStatusResponse {
  profile: ProfileDto;
  transactions: TransactionDto[];
}

