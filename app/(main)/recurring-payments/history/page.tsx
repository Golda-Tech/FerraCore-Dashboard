"use client"

// This page reads search params on the client to avoid server/client
// mismatches in production builds.
import { useSearchParams } from "next/navigation"
import { RecurringPaymentsHistoryContent } from "@/components/recurring-payments-history-content"

export default function RecurringPaymentsHistoryPage() {
  const searchParams = useSearchParams()

  // Read raw values; Next already decodes query parameters.
  const userEmail = searchParams.get("userEmail") || ""
  const name = searchParams.get("name") || ""

  return (
    <RecurringPaymentsHistoryContent
      userEmail={userEmail}
      partnerName={name}
    />
  )
}
