"use client";

import { use } from "react";
import { PartnerTransactionsContent } from "@/components/partner-transactions-content";

interface PageProps {
  params: Promise<{ email: string }>;
  searchParams: Promise<{ name?: string }>;
}

export default function PartnerTransactionsPage({ params, searchParams }: PageProps) {
  const { email } = use(params);
  const { name } = use(searchParams);
  const decodedEmail = decodeURIComponent(email);

  return (
    <PartnerTransactionsContent
      partnerEmail={decodedEmail}
      partnerName={name}
    />
  );
}

