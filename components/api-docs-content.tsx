"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  ArrowLeft,
  BookOpen,
  Lock,
  Unlock,
  Globe,
  Mail,
  CreditCard,
  RefreshCw,
  FileText,
  Shield,
  Webhook,
  Server,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface EndpointDef {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  auth: "bearer" | "none" | "basic";
  headers?: { key: string; value: string; description?: string }[];
  queryParams?: { key: string; type: string; required: boolean; description: string }[];
  requestBody?: { raw: string; description?: string };
  responseExample?: { status: number; body: string; description?: string };
  notes?: string;
}

/* ------------------------------------------------------------------ */
/*  Endpoint Data – combined & curated from both Postman collections  */
/* ------------------------------------------------------------------ */

const authEndpoints: EndpointDef[] = [
  {
    id: "access-token",
    name: "Generate Access Token",
    method: "POST",
    path: "/api/v1/subscriptions/tokens",
    description:
      "Authenticates using your Subscription Key and Subscription Secret to obtain a Bearer access token for all subsequent API operations.",
    auth: "none",
    headers: [
      { key: "Content-Type", value: "application/json" },
      { key: "Accept", value: "application/json" },
    ],
    requestBody: {
      raw: JSON.stringify(
        { subscriptionKey: "your_subscription_key", subscriptionSecret: "your_subscription_secret" },
        null,
        2
      ),
      description: "Provide the credentials issued to your organization during onboarding.",
    },
    responseExample: {
      status: 200,
      body: JSON.stringify(
        {
          access_token: "eyJhbGciOiJIUzI1NiJ9...",
          expires_in: 9728,
          subscriptionId: 5075,
          organization_info: {
            name: "Acme Corp",
            address: "123 Main St, Accra",
            planType: "ENTERPRISE_FULL_ACCESS",
            subscriptionStatus: "ACTIVE",
            phoneNumber: "233240000000",
            email: "info@acmecorp.com",
          },
          message: "Token generated successfully",
        },
        null,
        2
      ),
    },
    notes:
      "This is a public endpoint — no Bearer token is required. The returned access_token must be included as a Bearer token in the Authorization header for all protected endpoints.",
  },
];

const callbackEndpoints: EndpointDef[] = [
  {
    id: "mtn-callback",
    name: "Payment Callback (MTN)",
    method: "PUT",
    path: "/api/v1/payments/mtn/callback",
    description:
      "Processes an MTN Mobile Money callback notification. This endpoint is called by the payment provider when a transaction status changes. You can also configure your own callback URL in the dashboard under Settings → API & Keys.",
    auth: "bearer",
    headers: [
      { key: "Content-Type", value: "application/json" },
      { key: "Accept", value: "application/json" },
      { key: "Authorization", value: "Bearer YOUR_ACCESS_TOKEN" },
    ],
    requestBody: {
      raw: JSON.stringify(
        {
          externalId: "FCC-09216908-260112113420830",
          amount: "0.30",
          currency: "GHS",
          payer: { partyIdType: "MSISDN", partyId: "233249223888" },
          payerMessage: "Acme Corp",
          payeeNote: "Payment for order",
          status: "SUCCESSFUL",
          reason: "",
          financialTransactionId: "fa276d30-933d-432c-814c-20397a8c5431",
        },
        null,
        2
      ),
    },
    responseExample: {
      status: 200,
      body: JSON.stringify(
        {
          mandateId: "string",
          retrievalReference: "string",
          status: "INACTIVE",
          nextPaymentDueDate: "2026-02-01T20:07:59.297Z",
          lastPaymentStatus: "SUCCESSFUL",
        },
        null,
        2
      ),
    },
  },
];

const paymentEndpoints: EndpointDef[] = [
  {
    id: "initiate-payment",
    name: "Initiate Payment",
    method: "POST",
    path: "/api/v1/payments",
    description:
      "Initiates a new payment request to collect funds from a customer's mobile money wallet. The customer will receive a prompt on their phone to authorize the payment.",
    auth: "bearer",
    headers: [
      { key: "Content-Type", value: "application/json" },
      { key: "Authorization", value: "Bearer YOUR_ACCESS_TOKEN" },
      { key: "X-Callback-Url", value: "https://your-app.com/webhook", description: "Your webhook URL for payment notifications" },
      { key: "X-Reference-Id", value: "ref-12345", description: "Unique reference for idempotency" },
      { key: "X-Target-Environment", value: "sandbox", description: "sandbox or production" },
    ],
    requestBody: {
      raw: JSON.stringify(
        {
          provider: "MTN",
          collectionRef: "COLL-001",
          mobileNumber: "233240000000",
          amount: 10.0,
          currency: "GHS",
          partyIdType: "MSISDN",
          initiatedBy: "partner@example.com",
          initiationPartnerId: "partner-123",
          payerMessage: "Payment for order 123",
          payeeNote: "Thanks for your purchase",
        },
        null,
        2
      ),
      description: "All monetary values are in GHS. The mobileNumber must include the country code (233).",
    },
    responseExample: {
      status: 200,
      body: JSON.stringify(
        {
          transactionRef: "4243846303",
          status: "PENDING",
          message: "Payment request sent successfully",
        },
        null,
        2
      ),
    },
    queryParams: [
      { key: "provider", type: "string", required: true, description: "Payment provider (MTN, AIRTELTIGO, VODAFONE)" },
      { key: "mobileNumber", type: "string", required: true, description: "Customer MSISDN with country code (e.g. 233240000000)" },
      { key: "amount", type: "number", required: true, description: "Amount to charge in GHS" },
      { key: "currency", type: "string", required: true, description: "Currency code — currently only GHS supported" },
      { key: "collectionRef", type: "string", required: true, description: "Your unique collection reference" },
      { key: "initiatedBy", type: "string", required: true, description: "Email of the user/partner initiating the request" },
      { key: "payerMessage", type: "string", required: false, description: "Message displayed to the payer" },
      { key: "payeeNote", type: "string", required: false, description: "Note for the payee/merchant" },
    ],
  },
  {
    id: "check-payment-status",
    name: "Check Payment Status",
    method: "GET",
    path: "/api/v1/payments/status",
    description: "Checks the real-time status of a specific payment transaction by provider and transaction reference.",
    auth: "bearer",
    headers: [{ key: "Authorization", value: "Bearer YOUR_ACCESS_TOKEN" }],
    queryParams: [
      { key: "provider", type: "string", required: true, description: "Payment provider (e.g. MTN, AIRTELTIGO)" },
      { key: "transactionRef", type: "string", required: true, description: "The transaction reference returned from the Initiate Payment call" },
    ],
    responseExample: {
      status: 200,
      body: JSON.stringify(
        {
          transactionRef: "4243846303",
          status: "SUCCESSFUL",
          amount: 10.0,
          currency: "GHS",
          financialTransactionId: "78023346170",
          reason: "Payment completed",
        },
        null,
        2
      ),
    },
  },
  {
    id: "name-enquiry",
    name: "Name Enquiry",
    method: "GET",
    path: "/api/v1/payments/name-enquiry",
    description:
      "Retrieves account holder information for a given mobile number. Useful for confirming the customer identity before initiating a payment.",
    auth: "bearer",
    headers: [{ key: "Authorization", value: "Bearer YOUR_ACCESS_TOKEN" }],
    queryParams: [
      { key: "mobileNumber", type: "string", required: true, description: "The MSISDN to look up (e.g. 233240000000)" },
    ],
    responseExample: {
      status: 200,
      body: JSON.stringify(
        {
          name: "John Doe",
          mobileNumber: "233240000000",
          provider: "MTN",
        },
        null,
        2
      ),
    },
  },
  {
    id: "get-payment",
    name: "Get Payment by Reference",
    method: "GET",
    path: "/api/v1/payments/{transactionRef}",
    description: "Retrieves full details of a single payment using its transaction reference.",
    auth: "bearer",
    headers: [{ key: "Authorization", value: "Bearer YOUR_ACCESS_TOKEN" }],
    responseExample: {
      status: 200,
      body: JSON.stringify(
        {
          id: 35683,
          transactionRef: "6e385829-1edf-4225-9c2f-38df924ceb3a",
          provider: "MTN",
          mobileNumber: "233249267186",
          amount: 49.59,
          amountCustomerPays: 49.0,
          transactionFee: 0.59,
          currency: "GHS",
          status: "SUCCESSFUL",
          initiatedBy: "partner@example.com",
          initiatedAt: "2026-03-26T22:09:00.145462",
          completedAt: "2026-03-26T22:10:01.145279",
        },
        null,
        2
      ),
    },
  },
];

const recurringEndpoints: EndpointDef[] = [
  {
    id: "initiate-subscription",
    name: "Initiate Subscription",
    method: "POST",
    path: "/api/v1/recurring-payments/subscription",
    description:
      "Creates a new recurring payment subscription (auto-debit). The customer will receive an OTP to authorize the subscription. Supports daily (DLY), weekly (WKL), and monthly (MTH) cycles.",
    auth: "bearer",
    headers: [
      { key: "Content-Type", value: "application/json" },
      { key: "Authorization", value: "Bearer YOUR_ACCESS_TOKEN" },
    ],
    requestBody: {
      raw: JSON.stringify(
        {
          customerNumber: "233595999364",
          customerName: "John Kamara",
          amount: "10.00",
          cycle: "DLY",
          startDate: "2026-03-01T09:00:00Z",
          endDate: "2026-09-01T09:00:00Z",
          networkProvider: "MTN",
          reference: "Auto Debit Test",
          returnUrl: "https://your-app.com/payment/callback",
          resumable: "Y",
          cycleSkip: "Y",
        },
        null,
        2
      ),
      description:
        "cycle options: DLY (Daily), WKL (Weekly), MTH (Monthly). resumable: Y/N — whether the subscription can be paused & resumed. cycleSkip: Y/N — whether missed cycles are skipped.",
    },
    queryParams: [
      { key: "customerNumber", type: "string", required: true, description: "Customer MSISDN with country code" },
      { key: "customerName", type: "string", required: true, description: "Name of the customer" },
      { key: "amount", type: "string", required: true, description: "Recurring charge amount" },
      { key: "cycle", type: "string", required: true, description: "Debit cycle: DLY, WKL, or MTH" },
      { key: "startDate", type: "string", required: true, description: "Start date (ISO 8601)" },
      { key: "endDate", type: "string", required: true, description: "End date (ISO 8601)" },
      { key: "networkProvider", type: "string", required: true, description: "Network provider (MTN)" },
      { key: "reference", type: "string", required: true, description: "Your reference for this subscription" },
      { key: "returnUrl", type: "string", required: true, description: "Callback URL for payment notifications" },
      { key: "resumable", type: "string", required: false, description: "Y or N — whether the subscription can be paused and resumed" },
      { key: "cycleSkip", type: "string", required: false, description: "Y or N — whether missed cycles can be skipped" },
    ],
    responseExample: {
      status: 200,
      body: JSON.stringify(
        {
          subscriptionId: "8901234567891",
          status: "PENDING_OTP",
          message: "OTP sent to customer. Please authorize.",
        },
        null,
        2
      ),
    },
  },
  {
    id: "authorize-otp",
    name: "Authorize OTP",
    method: "POST",
    path: "/api/v1/recurring-payments/authorize-otp",
    description: "Authorizes a recurring payment subscription by verifying the OTP sent to the customer.",
    auth: "bearer",
    headers: [
      { key: "Content-Type", value: "application/json" },
      { key: "Authorization", value: "Bearer YOUR_ACCESS_TOKEN" },
    ],
    requestBody: {
      raw: JSON.stringify({ subscriptionId: "8901234567891", authCode: "12345" }, null, 2),
    },
    responseExample: {
      status: 200,
      body: JSON.stringify(
        { subscriptionId: "8901234567891", status: "ACTIVE", message: "Subscription authorized" },
        null,
        2
      ),
    },
  },
  {
    id: "get-subscription",
    name: "Get Subscription",
    method: "GET",
    path: "/api/v1/recurring-payments/{subscriptionId}",
    description: "Retrieves the details and current status of a recurring payment subscription.",
    auth: "bearer",
    headers: [{ key: "Authorization", value: "Bearer YOUR_ACCESS_TOKEN" }],
    responseExample: {
      status: 200,
      body: JSON.stringify(
        {
          subscriptionId: "8901234567891",
          customerNumber: "233595999364",
          customerName: "John Kamara",
          amount: "10.00",
          cycle: "DLY",
          status: "ACTIVE",
          startDate: "2026-03-01T09:00:00Z",
          endDate: "2026-09-01T09:00:00Z",
          networkProvider: "MTN",
        },
        null,
        2
      ),
    },
  },
  {
    id: "cancel-subscription",
    name: "Cancel Subscription",
    method: "DELETE",
    path: "/api/v1/recurring-payments/{subscriptionId}",
    description: "Cancels an active recurring payment subscription. No further debits will occur.",
    auth: "bearer",
    headers: [{ key: "Authorization", value: "Bearer YOUR_ACCESS_TOKEN" }],
    responseExample: {
      status: 200,
      body: JSON.stringify(
        { subscriptionId: "8901234567891", status: "CANCELLED", message: "Subscription cancelled" },
        null,
        2
      ),
    },
  },
  {
    id: "resend-otp",
    name: "Resend OTP",
    method: "POST",
    path: "/api/v1/recurring-payments/{subscriptionId}/resend-otp",
    description: "Resends the OTP for a subscription that is pending authorization.",
    auth: "bearer",
    headers: [
      { key: "Content-Type", value: "application/json" },
      { key: "Authorization", value: "Bearer YOUR_ACCESS_TOKEN" },
    ],
    responseExample: {
      status: 200,
      body: JSON.stringify({ message: "OTP resent successfully" }, null, 2),
    },
  },
  {
    id: "provider-status",
    name: "Get Provider Subscription Status",
    method: "GET",
    path: "/api/v1/recurring-payments/{subscriptionId}/status",
    description: "Checks the subscription status directly from the network provider.",
    auth: "bearer",
    headers: [{ key: "Authorization", value: "Bearer YOUR_ACCESS_TOKEN" }],
    responseExample: {
      status: 200,
      body: JSON.stringify(
        { subscriptionId: "8901234567891", providerStatus: "ACTIVE", lastDebitDate: "2026-03-28T09:00:00Z" },
        null,
        2
      ),
    },
  },
  {
    id: "create-invoice",
    name: "Create Invoice",
    method: "POST",
    path: "/api/v1/recurring-payments/invoice",
    description: "Creates an invoice for a recurring subscription installment payment.",
    auth: "bearer",
    headers: [
      { key: "Content-Type", value: "application/json" },
      { key: "Authorization", value: "Bearer YOUR_ACCESS_TOKEN" },
    ],
    requestBody: {
      raw: JSON.stringify(
        {
          customerNumber: "233595999364",
          amountDue: "15.00",
          invoiceReference: "INV-1001",
          description: "Installment Payment – Subscription ID 8901234567891",
          expiryDate: "2026-03-31T23:59:59Z",
        },
        null,
        2
      ),
    },
    responseExample: {
      status: 200,
      body: JSON.stringify(
        { invoiceId: "INV-1001", status: "CREATED", message: "Invoice created successfully" },
        null,
        2
      ),
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Reusable Sub-components                                           */
/* ------------------------------------------------------------------ */

const MethodBadge = ({ method }: { method: string }) => {
  const colors: Record<string, string> = {
    GET: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    POST: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    PUT: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    DELETE: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold tracking-wide font-mono ${colors[method] ?? "bg-gray-100 text-gray-800"}`}
    >
      {method}
    </span>
  );
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="absolute right-3 top-3 rounded-md p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
      title="Copy"
    >
      {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative group">
      <CopyButton text={code} />
      <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 pr-12 text-sm text-gray-100 font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function buildCurl(ep: EndpointDef): string {
  const base = "https://api.ferracore.tech";
  let curl = `curl -X ${ep.method} "${base}${ep.path}"`;
  if (ep.headers) {
    ep.headers.forEach((h) => {
      curl += ` \\\n  -H "${h.key}: ${h.value}"`;
    });
  }
  if (ep.requestBody) {
    curl += ` \\\n  -d '${ep.requestBody.raw}'`;
  }
  if (ep.queryParams && ep.method === "GET") {
    const qs = ep.queryParams.map((p) => `${p.key}={${p.key}}`).join("&");
    // Replace the base path with query string version
    curl = curl.replace(`"${base}${ep.path}"`, `"${base}${ep.path}?${qs}"`);
  }
  return curl;
}

function EndpointCard({ ep }: { ep: EndpointDef }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-xl overflow-hidden transition-all hover:shadow-md">
      {/* Header – always visible */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <MethodBadge method={ep.method} />
        <code className="text-sm font-mono text-muted-foreground flex-1 truncate">{ep.path}</code>
        <span className="hidden sm:block text-sm font-medium mr-2">{ep.name}</span>
        {ep.auth === "bearer" ? (
          <Lock className="h-4 w-4 text-amber-500 shrink-0" />
        ) : (
          <Unlock className="h-4 w-4 text-emerald-500 shrink-0" />
        )}
        {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
      </button>

      {/* Body – expandable */}
      {open && (
        <div className="border-t px-4 pb-5 pt-4 space-y-5 bg-muted/20">
          <p className="text-sm leading-relaxed">{ep.description}</p>

          {ep.notes && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300">
              <Zap className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{ep.notes}</span>
            </div>
          )}

          {/* Auth Badge */}
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Authentication:</span>
            {ep.auth === "bearer" ? (
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">
                Bearer Token
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">
                Public (No auth)
              </Badge>
            )}
          </div>

          {/* Headers */}
          {ep.headers && ep.headers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Headers</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-muted/60">
                      <th className="text-left px-3 py-2 font-medium">Key</th>
                      <th className="text-left px-3 py-2 font-medium">Value</th>
                      <th className="text-left px-3 py-2 font-medium hidden sm:table-cell">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ep.headers.map((h) => (
                      <tr key={h.key} className="border-t">
                        <td className="px-3 py-2 font-mono text-xs">{h.key}</td>
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{h.value}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground hidden sm:table-cell">{h.description ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Query / Body Parameters */}
          {ep.queryParams && ep.queryParams.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{ep.requestBody ? "Body Parameters" : "Query Parameters"}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-muted/60">
                      <th className="text-left px-3 py-2 font-medium">Parameter</th>
                      <th className="text-left px-3 py-2 font-medium">Type</th>
                      <th className="text-left px-3 py-2 font-medium">Required</th>
                      <th className="text-left px-3 py-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ep.queryParams.map((p) => (
                      <tr key={p.key} className="border-t">
                        <td className="px-3 py-2 font-mono text-xs">{p.key}</td>
                        <td className="px-3 py-2 text-xs">{p.type}</td>
                        <td className="px-3 py-2 text-xs">
                          {p.required ? (
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                              Required
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Optional</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Request Body */}
          {ep.requestBody && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Request Body</h4>
              {ep.requestBody.description && (
                <p className="text-xs text-muted-foreground">{ep.requestBody.description}</p>
              )}
              <CodeBlock code={ep.requestBody.raw} />
            </div>
          )}

          {/* Sample cURL */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">cURL Example</h4>
            <CodeBlock code={buildCurl(ep)} />
          </div>

          {/* Response */}
          {ep.responseExample && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">Response</h4>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                  {ep.responseExample.status} OK
                </Badge>
              </div>
              <CodeBlock code={ep.responseExample.body} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PDF Export helper                                                  */
/* ------------------------------------------------------------------ */
function exportDocsToPdf() {
  Promise.all([import("jspdf"), import("jspdf-autotable")]).then(
    ([{ default: jsPDF }]) => {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const PW = doc.internal.pageSize.getWidth();
      const PH = doc.internal.pageSize.getHeight();
      const M = 15;
      const CW = PW - M * 2;
      let y = 20;
      let pg = 1;

      const newPage = () => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(160, 160, 160);
        doc.text("RexHub Payment Gateway  |  API v1", PW / 2, PH - 8, { align: "center" });
        doc.text("Page " + pg, PW - M, PH - 8, { align: "right" });
        doc.addPage();
        pg++;
        y = 20;
      };
      const need = (h: number) => { if (y + h > PH - 16) newPage(); };

      const printCode = (raw: string, maxLines = 20) => {
        doc.setFont("courier", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(50, 50, 50);
        const lineH = 3.4;
        const rawLines = raw.split("\n");
        let printed = 0;
        for (const rl of rawLines) {
          if (printed >= maxLines) break;
          const wrapped: string[] = doc.splitTextToSize(rl || " ", CW - 6);
          for (const wl of wrapped) {
            if (printed >= maxLines) break;
            need(lineH + 1);
            doc.text(wl, M + 3, y);
            y += lineH;
            printed++;
          }
        }
        y += 2;
      };

      /* ---- Title ---- */
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(20, 20, 20);
      doc.text("RexHub Payment Gateway", PW / 2, y, { align: "center" });
      y += 8;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("API v1  -  Reference Documentation", PW / 2, y, { align: "center" });
      y += 5;

      doc.setFontSize(9);
      doc.text("Powered by Ferracore Technologies", PW / 2, y, { align: "center" });
      y += 4;

      const ds = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
      doc.setTextColor(140, 140, 140);
      doc.text("Generated: " + ds + "   |   Version 1.0", PW / 2, y, { align: "center" });
      y += 8;

      doc.setDrawColor(200, 200, 200);
      doc.line(M, y, PW - M, y);
      y += 8;

      /* ---- Base URL ---- */
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text("Base URL", M, y);
      y += 6;

      doc.setFont("courier", "normal");
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text("https://api.ferracore.tech", M, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("All endpoints are under API version 1:  /api/v1/*", M, y);
      y += 8;

      doc.setDrawColor(200, 200, 200);
      doc.line(M, y, PW - M, y);
      y += 8;

      /* ---- Basic Auth Header ---- */
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text("Basic Auth Header (Alternative)", M, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const ad = "You can authenticate the token endpoint using a Basic Authorization header. " +
        "Base64-encode your Subscription Key and Secret separated by a colon.";
      const adL: string[] = doc.splitTextToSize(ad, CW);
      doc.text(adL, M, y);
      y += adL.length * 4 + 4;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text("Format:", M, y);
      y += 5;

      printCode("your_subscription_key:your_subscription_secret  -->  Base64 encode\n\nAuthorization: Basic <Base64-encoded-string>");
      y += 2;

      doc.setDrawColor(200, 200, 200);
      doc.line(M, y, PW - M, y);
      y += 8;

      /* ---- Endpoint Sections ---- */
      const sections: { title: string; endpoints: EndpointDef[] }[] = [
        { title: "1. Authentication", endpoints: authEndpoints },
        { title: "2. Callback / Webhook", endpoints: callbackEndpoints },
        { title: "3. Payment Operations", endpoints: paymentEndpoints },
        { title: "4. Recurring Payments (Auto-Debit)", endpoints: recurringEndpoints },
      ];

      sections.forEach((section) => {
        need(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(20, 20, 20);
        doc.text(section.title, M, y);
        y += 9;

        section.endpoints.forEach((ep) => {
          need(28);

          // Method + path
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(40, 40, 40);
          doc.text(ep.method + "  " + ep.path, M, y);
          y += 5;

          // Endpoint name
          doc.setFontSize(9);
          doc.setTextColor(70, 70, 70);
          doc.text(ep.name, M, y);
          y += 5;

          // Description
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(80, 80, 80);
          const descLines: string[] = doc.splitTextToSize(ep.description, CW);
          for (const line of descLines) {
            need(4);
            doc.text(line, M, y);
            y += 3.8;
          }
          y += 2;

          // Auth
          doc.setFontSize(8);
          doc.setTextColor(120, 120, 120);
          doc.text("Auth: " + (ep.auth === "bearer" ? "Bearer Token (required)" : "Public (no auth needed)"), M, y);
          y += 5;

          // Request body
          if (ep.requestBody) {
            need(16);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(40, 40, 40);
            doc.text("Request Body:", M, y);
            y += 4;
            printCode(ep.requestBody.raw, 18);
          }

          // Response
          if (ep.responseExample) {
            need(16);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(40, 40, 40);
            doc.text("Response (" + ep.responseExample.status + "):", M, y);
            y += 4;
            printCode(ep.responseExample.body, 18);
          }

          // Separator
          y += 3;
          need(5);
          doc.setDrawColor(220, 220, 220);
          doc.line(M, y, PW - M, y);
          y += 6;
        });
      });

      /* ---- Support ---- */
      need(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text("Support & Contact", M, y);
      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text("Technical Support:  support@rexhub.com", M, y);
      y += 5;
      doc.text("Onboarding:  onboarding@rexhub.com", M, y);
      y += 8;

      doc.setFontSize(8);
      doc.setTextColor(160, 160, 160);
      doc.text("RexHub Payment Gateway  -  API v1", PW / 2, y, { align: "center" });

      // Final page footer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text("RexHub Payment Gateway  |  API v1", PW / 2, PH - 8, { align: "center" });
      doc.text("Page " + pg, PW - M, PH - 8, { align: "right" });

      doc.save("RexHub-API-v1-Documentation.pdf");
    }
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */
export function ApiDocsContent() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-primary" />
              API Documentation
              <Badge className="bg-primary/10 text-primary text-xs font-semibold ml-1">v1</Badge>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              RexHub Payment Gateway &middot; API Version 1 &middot; Powered by Ferracore Technologies
            </p>
          </div>
        </div>
        <Button onClick={exportDocsToPdf} className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
            <Globe className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="auth" className="gap-1.5 text-xs sm:text-sm">
            <Lock className="h-3.5 w-3.5" /> Authentication
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-1.5 text-xs sm:text-sm">
            <CreditCard className="h-3.5 w-3.5" /> Payments
          </TabsTrigger>
          <TabsTrigger value="recurring" className="gap-1.5 text-xs sm:text-sm">
            <RefreshCw className="h-3.5 w-3.5" /> Recurring
          </TabsTrigger>
          <TabsTrigger value="callbacks" className="gap-1.5 text-xs sm:text-sm">
            <Webhook className="h-3.5 w-3.5" /> Callbacks
          </TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW ===== */}
        <TabsContent value="overview" className="space-y-6">
          {/* Hero Card */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-xl font-bold">Welcome to the RexHub Payment Gateway API <span className="text-primary">v1</span></h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The RexHub Payment Gateway provides a robust, secure platform for businesses to process
                payments, handle recurring subscriptions, and receive real-time webhook
                notifications — all through a single, unified API.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: CreditCard, title: "Process Payments", desc: "Collect funds via mobile money" },
                  { icon: RefreshCw, title: "Auto-Debit", desc: "Recurring subscription debits" },
                  { icon: Webhook, title: "Webhooks", desc: "Real-time payment notifications" },
                ].map((f) => (
                  <div
                    key={f.title}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-background"
                  >
                    <f.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{f.title}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Base URL */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Server className="h-5 w-5" /> Base URL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock code="https://api.ferracore.tech" />
              <p className="text-xs text-muted-foreground mt-2">
                All API requests should be made to this base URL followed by the endpoint path.
                All endpoints are under <strong>API version 1</strong>: <code className="bg-muted px-1 rounded">/api/v1/*</code>
              </p>
            </CardContent>
          </Card>

          {/* Authentication Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="h-5 w-5" /> Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg border space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-100 text-amber-800">Bearer Token</Badge>
                    <span className="text-xs text-muted-foreground">Most endpoints</span>
                  </div>
                  <CodeBlock code={'Authorization: Bearer YOUR_ACCESS_TOKEN'} />
                  <p className="text-xs text-muted-foreground">
                    Obtain your token via the <strong>Generate Access Token</strong> endpoint using
                    your Subscription Key and Secret.
                  </p>
                </div>
                <div className="p-4 rounded-lg border space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Public</Badge>
                    <span className="text-xs text-muted-foreground">Token generation only</span>
                  </div>
                  <CodeBlock code={'POST /api/v1/subscriptions/tokens\n\n// No Authorization header needed'} />
                  <p className="text-xs text-muted-foreground">
                    The token endpoint is public — supply your credentials in the request body.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-5 w-5" /> Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                <strong>Important:</strong> Registration is not self-service. Follow these steps to get started:
              </p>
              <ol className="text-sm space-y-2 pl-5 list-decimal marker:text-primary">
                <li>
                  <strong>Contact RexHub</strong> at{" "}
                  <a href="mailto:onboarding@rexhub.com" className="text-primary underline">
                    onboarding@rexhub.com
                  </a>{" "}
                  with your business details.
                </li>
                <li>
                  <strong>Provide business documentation</strong> as requested by the onboarding team.
                </li>
                <li>
                  <strong>Receive registration email</strong> with temporary credentials.
                </li>
                <li>
                  <strong>Follow email prompts</strong> to complete onboarding and set a permanent password.
                </li>
                <li>
                  <strong>Access the RexHub Dashboard</strong> to update your business profile, manage API
                  keys, whitelist phone numbers, and configure webhook callbacks.
                </li>
                <li>
                  <strong>Generate an access token</strong> using your Subscription Key & Secret, then start
                  making API calls.
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Error Handling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5" /> Error Handling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                All errors follow a consistent RFC 7807 Problem Details format:
              </p>
              <CodeBlock
                code={JSON.stringify(
                  {
                    type: "https://ferracore.tech/errors/400",
                    title: "Bad Request",
                    status: 400,
                    detail: "Descriptive error message",
                    instance: "/api/v1/payments",
                    error_category: "Validation",
                  },
                  null,
                  2
                )}
              />
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-muted/60">
                      <th className="text-left px-3 py-2 font-medium">Status</th>
                      <th className="text-left px-3 py-2 font-medium">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { code: "200", desc: "Success" },
                      { code: "400", desc: "Bad Request — Invalid parameters or payload" },
                      { code: "401", desc: "Unauthorized — Invalid or missing token" },
                      { code: "403", desc: "Forbidden — Insufficient permissions" },
                      { code: "404", desc: "Not Found — Resource does not exist" },
                      { code: "500", desc: "Server Error — Something went wrong on our end" },
                    ].map((r) => (
                      <tr key={r.code} className="border-t">
                        <td className="px-3 py-2 font-mono text-xs font-bold">{r.code}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{r.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-5 w-5" /> Support & Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg border space-y-1">
                  <p className="text-sm font-semibold">Technical Support</p>
                  <a href="mailto:support@rexhub.com" className="text-sm text-primary underline">
                    support@rexhub.com
                  </a>
                </div>
                <div className="p-4 rounded-lg border space-y-1">
                  <p className="text-sm font-semibold">Registration &amp; Onboarding</p>
                  <a href="mailto:onboarding@rexhub.com" className="text-sm text-primary underline">
                    onboarding@rexhub.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== AUTHENTICATION ===== */}
        <TabsContent value="auth" className="space-y-4">
          <div className="space-y-2 mb-4">
            <h2 className="text-xl font-bold">Authentication</h2>
            <p className="text-sm text-muted-foreground">
              Generate a Bearer token using your Subscription Key and Secret. The token is valid for
              the duration specified in <code className="bg-muted px-1 rounded">expires_in</code> (seconds).
              Include it in all subsequent requests.
            </p>
          </div>

          {/* Basic Auth Header explanation */}
          <Card className="border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                Basic Auth Header
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Instead of passing credentials in the request body, you can also authenticate using a
                <strong> Basic Authorization header</strong>. Construct the header by Base64-encoding your
                Subscription Key and Subscription Secret separated by a colon:
              </p>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Step 1 — Concatenate key and secret</h4>
                <CodeBlock code={`your_subscription_key:your_subscription_secret`} />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Step 2 — Base64-encode the string</h4>
                <CodeBlock code={`echo -n "your_subscription_key:your_subscription_secret" | base64\n\n# Output: eW91cl9zdWJzY3JpcHRpb25fa2V5OnlvdXJfc3Vic2NyaXB0aW9uX3NlY3JldA==`} />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Step 3 — Include in the Authorization header</h4>
                <CodeBlock code={`Authorization: Basic eW91cl9zdWJzY3JpcHRpb25fa2V5OnlvdXJfc3Vic2NyaXB0aW9uX3NlY3JldA==`} />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Sample cURL with Basic Auth</h4>
                <CodeBlock code={`curl -X POST "https://api.ferracore.tech/api/v1/subscriptions/tokens" \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Basic eW91cl9zdWJzY3JpcHRpb25fa2V5OnlvdXJfc3Vic2NyaXB0aW9uX3NlY3JldA==" \\\n  -d '{\n  "subscriptionKey": "your_subscription_key",\n  "subscriptionSecret": "your_subscription_secret"\n}'`} />
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
                <Zap className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Note:</strong> Both methods (Basic header and body credentials) are accepted.
                  The returned <code className="bg-muted px-1 rounded text-xs">access_token</code> is
                  identical regardless of the method used.
                </span>
              </div>
            </CardContent>
          </Card>

          {authEndpoints.map((ep) => (
            <EndpointCard key={ep.id} ep={ep} />
          ))}
        </TabsContent>

        {/* ===== PAYMENTS ===== */}
        <TabsContent value="payments" className="space-y-4">
          <div className="space-y-2 mb-4">
            <h2 className="text-xl font-bold">Payment Operations</h2>
            <p className="text-sm text-muted-foreground">
              Initiate payments, check statuses, perform name enquiries, and retrieve payment details.
              All payment endpoints require a valid Bearer token.
            </p>
          </div>
          {paymentEndpoints.map((ep) => (
            <EndpointCard key={ep.id} ep={ep} />
          ))}
        </TabsContent>

        {/* ===== RECURRING ===== */}
        <TabsContent value="recurring" className="space-y-4">
          <div className="space-y-2 mb-4">
            <h2 className="text-xl font-bold">Recurring Payments (Auto-Debit)</h2>
            <p className="text-sm text-muted-foreground">
              Create recurring payment subscriptions that automatically debit customers on a schedule.
              Supports daily, weekly, and monthly cycles with OTP-based authorization.
            </p>
          </div>
          {recurringEndpoints.map((ep) => (
            <EndpointCard key={ep.id} ep={ep} />
          ))}
        </TabsContent>

        {/* ===== CALLBACKS ===== */}
        <TabsContent value="callbacks" className="space-y-4">
          <div className="space-y-2 mb-4">
            <h2 className="text-xl font-bold">Callback / Webhook</h2>
            <p className="text-sm text-muted-foreground">
              Configure your callback URL in the RexHub Dashboard under{" "}
              <strong>Settings → API &amp; Keys</strong>. When a payment status changes, RexHub will
              send a notification to your configured URL.
            </p>
          </div>

          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="pt-5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Webhook className="h-4 w-4 text-blue-600" />
                Setting Up Your Callback URL
              </h3>
              <ol className="text-sm space-y-1.5 pl-5 list-decimal text-muted-foreground">
                <li>Navigate to <strong>Settings → API &amp; Keys</strong> in your dashboard.</li>
                <li>Enter your webhook URL in the <strong>X-Callback-Url</strong> field.</li>
                <li>Click <strong>Save Changes</strong>.</li>
                <li>RexHub will send a <code className="bg-muted px-1 rounded text-xs">PUT</code> request to your URL on every status change.</li>
              </ol>
            </CardContent>
          </Card>

          {callbackEndpoints.map((ep) => (
            <EndpointCard key={ep.id} ep={ep} />
          ))}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Callback Payload Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-muted/60">
                      <th className="text-left px-3 py-2 font-medium">Field</th>
                      <th className="text-left px-3 py-2 font-medium">Type</th>
                      <th className="text-left px-3 py-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { field: "externalId", type: "string", desc: "Your external reference for the transaction" },
                      { field: "amount", type: "string", desc: "Transaction amount" },
                      { field: "currency", type: "string", desc: "Currency code (GHS)" },
                      { field: "payer", type: "object", desc: "Payer details — partyIdType and partyId" },
                      { field: "status", type: "string", desc: "SUCCESSFUL, FAILED, or PENDING" },
                      { field: "reason", type: "string", desc: "Failure reason (empty on success)" },
                      { field: "financialTransactionId", type: "string", desc: "Provider's financial transaction ID" },
                    ].map((r) => (
                      <tr key={r.field} className="border-t">
                        <td className="px-3 py-2 font-mono text-xs">{r.field}</td>
                        <td className="px-3 py-2 text-xs">{r.type}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{r.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

