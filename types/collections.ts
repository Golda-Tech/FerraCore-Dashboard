export type CollectionStatus =
  | "SUCCESS"
  | "FAILED"
  | "ONGOING"
  | "CANCELLED"
  | "PENDING_EXTERNAL"
  | "REFUNDED"
  | "INITIATED";

export interface Collection {
  id: number;
  collectionRef: string;
  externalRef: string;
  amount: number;
  currency: string;
  customerId: string;
  status: CollectionStatus;
  initiatedAt: string;
  updatedAt: string;
  message: string;
}

export interface StatusSummary {
  SUCCESS: number;
  FAILED: number;
  ONGOING: number;
}

export interface CollectionTrend {
  date: string;
  totalCount: number;
  totalAmount: number;
  channelCounts: Record<string, number>;
  statusCounts: Record<CollectionStatus, number>;
}

export interface CreateCollectionResponse {
  id: number;
  collectionRef: string;
  externalRef: string;
  amount: number;
  currency: string;
  customerId: string;
  status: CollectionStatus;
  initiatedAt: string;
  updatedAt: string;
  message: string;
}

export interface CreateCollectionRequest {
  amount: number;
  currency: string;
  customerId: string;
  description: string;
  paymentChannel: string;
  provider: string;
  merchantName: string;
  clientRequestId: string;
}
