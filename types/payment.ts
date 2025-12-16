
export type PaymentStatus =
  | "SUCCESS"
  | "PENDING"
  | "SUCCESSFUL"
  | "FAILED"
  | "ONGOING"
  | "CANCELLED"
  | "PENDING_EXTERNAL"
  | "REFUNDED"
  | "INITIATED";


export interface CreatePaymentRequest {
  provider: string;
  collectionRef: string;
  mobileNumber: string;
  initiatedBy: string;
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
  currency: string;
  status: string;
  message?: string | null;
  initiatedAt: string;
  initiatedBy: string;
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

