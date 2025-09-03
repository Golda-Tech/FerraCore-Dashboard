"use client";
import api from "./api";
import {
  Collection,
  StatusSummary,
  CollectionTrend,
  CreateCollectionRequest,
  CreateCollectionResponse,
} from "@/types/collections";

// Fetch all collections, optional date range and pagination
export async function getCollections(
  startDate?: string,
  endDate?: string,
  page: number = 0,
  size: number = 20
): Promise<Collection[]> {
  const params: any = { page, size };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await api.get<Collection[]>("/api/v1/collections", {
    params,
  });
  return response.data;
}

// Fetch single collection by collectionRef
export async function getCollection(
  collectionRef: string
): Promise<Collection> {
  const response = await api.get<Collection>(
    `/api/v1/collections/${collectionRef}`
  );
  return response.data;
}

// Get collections status summary
export async function getCollectionsStatusSummary(): Promise<StatusSummary> {
  const response = await api.get<StatusSummary>(
    "/api/v1/collections/status-summary"
  );
  return response.data;
}

// Fetch collections trends
export async function getCollectionsTrends(
  startDate: string,
  endDate: string,
  interval: "DAILY" | "WEEKLY" | "MONTHLY" = "DAILY"
): Promise<CollectionTrend[]> {
  const response = await api.get<CollectionTrend[]>(
    "/api/v1/collections/trends",
    {
      params: { startDate, endDate, interval },
    }
  );
  return response.data;
}

// Make a new collection/payment
export async function createCollection(
  data: CreateCollectionRequest
): Promise<CreateCollectionResponse> {
  const response = await api.post<CreateCollectionResponse>(
    "/api/v1/collections",
    data
  );
  return response.data;
}
