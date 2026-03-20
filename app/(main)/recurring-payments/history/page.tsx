"use client"

import { use } from "react"
import { useSearchParams } from "next/navigation"
import { RecurringPaymentsHistoryContent } from "@/components/recurring-payments-history-content"

interface SearchParams {
  userEmail?: string
  name?: string
}

export default function RecurringPaymentsHistoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolved = use(searchParams)
  const userEmail = resolved.userEmail ?? ""
  const name = resolved.name ?? ""

  return (
    <RecurringPaymentsHistoryContent
      userEmail={decodeURIComponent(userEmail)}
      partnerName={decodeURIComponent(name)}
    />
  )
}

