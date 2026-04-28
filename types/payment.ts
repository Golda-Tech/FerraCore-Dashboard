export type PaymentStatus =
  | "SUCCESS"
  | "PENDING"
  | "SUCCESSFUL"
  | "FAILED"
  | "ONGOING"
  | "CANCELLED"
  | "PENDING_EXTERNAL"
  | "REFUNDED"
  | "INITIATED"
  | "EXPIRED";


export type Interval = "DAILY" | "WEEKLY" | "MONTHLY";

export interface CreatePaymentRequest {
  provider: string;
  collectionRef: string;
  mobileNumber: string;
  initiatedBy: string;
  initiationPartnerId: string;
  amount: number;
  currency: string;
  partyIdType: string;
  payerMessage?: string;
  payeeNote?: string;
}

export interface CreatePaymentResponse {
  transactionRef: string;
  externalRef: string;
  status: string;
  message?: string;
}

export interface Payment {
  id: number;
  transactionRef: string;
  externalRef: string;
  collectionRef: string;
  provider: string;
  mobileNumber: string;
  amount: number;
  amountCustomerPays: number;
  transactionFee: number;
  currency: string;
  callbackStatus?: string | null;
  status: string;
  message?: string | null;
  initiatedAt: string;
  initiatedBy: string;
  initiationPartner: string;
  userRoles?: string[] | null;
  completedAt?: string | null;
  mtnFinancialTransactionId?: string | null;
  mtnExternalId?: string | null;
  mtnPayerPartyIdType: string;
  mtnPayerPartyId: string;
  mtnPayerMessage?: string | null;
  mtnPayeeNote?: string | null;
}

export interface TransactionStatus {
  transactionRef: string;
  externalRef: string;
  status: string;
  message?: string | null;
}

export interface UserInfo {
  mobileNumber: string;
  accountName: string;
  accountNumber?: string | null;
  bankCode?: string | null;
  bankName?: string | null;
  message?: string;
}


export interface StatusSummary {
  SUCCESS: number;
  FAILED: number;
  ONGOING: number;
}

export interface PaymentTrend {
  date: string;
  totalCount: number;
  totalAmount: number;
  channelCounts: Record<string, number>;
  statusCounts: Record<PaymentStatus, number>;
}

export interface OptimizedPaymentsQuery {
  q?: string;
  statuses?: string[];
  startDate?: string;
  endDate?: string;
  initiatedBy?: string;
  page?: number;
  size?: number;
  sort?: string;
  signal?: AbortSignal;
}

export interface OptimizedPaymentsResponse {
  items: Payment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  statusCounts: Partial<Record<PaymentStatus | string, number>>;
  totalAmount: number;
  todayAmount: number;
}

/** Shape returned by /api/v1/payments/optimized/partner-total */
export interface PartnerTotalResponse {
  partnerId: string;
  totalAmount: number;
}

/** Shape returned by /api/v1/payments/optimized/stream */
export interface StreamPaymentItem {
  customerMsisdn: string;
  reference: string;
  network: string;
  amountGhs: number;
  status: string;
  statusReason: string | null;
  /** Date represented as [year, month, day, hour, minute, second, nanos] */
  date: number[];
 xtargetReferenceId: string;
 telcoReference: string;
}

