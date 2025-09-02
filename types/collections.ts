export interface Collection {
  id: number;
  collectionRef: string;
  externalRef: string;
  amount: number;
  currency: string;
  customerId: string;
  status: "SUCCESS" | "FAILED" | "ONGOING";
  initiatedAt: string;
  updatedAt: string;
  message: string;
}

export interface CollectionsTrends {
  date: string;
  totalCount: number;
  totalAmount: number;
  channelCounts: Record<string, number>;
  statusCounts: Record<"SUCCESS" | "FAILED" | "ONGOING", number>;
}

export interface CollectionsStatusSummary {
  SUCCESS: number;
  FAILED: number;
  ONGOING: number;
}
