"use client";
import api from "./api";
import { Collection, CollectionsStatusSummary, CollectionsTrends } from "@/types/collections";

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

  const response = await api.get<Collection[]>("/api/v1/collections", { params });
  return response.data;
}

// Fetch single collection by collectionRef
export async function getCollection(collectionRef: string): Promise<Collection> {
  const response = await api.get<Collection>(`/api/v1/collections/${collectionRef}`);
  return response.data;
}

// Get collections status summary
export async function getCollectionsStatusSummary(): Promise<CollectionsStatusSummary> {
  const response = await api.get<CollectionsStatusSummary>("/api/v1/collections/status-summary");
  return response.data;
}

// Fetch collections trends
export async function getCollectionsTrends(
  startDate: string,
  endDate: string,
  interval: "DAILY" | "WEEKLY" | "MONTHLY" = "DAILY"
): Promise<CollectionsTrends[]> {
  const response = await api.get<CollectionsTrends[]>("/api/v1/collections/trends", {
    params: { startDate, endDate, interval },
  });
  return response.data;
}

// Make a new collection/payment
export async function createCollection(data: Partial<Collection>): Promise<Collection> {
  const response = await api.post<Collection>("/api/v1/collections", data);
  return response.data;
}
