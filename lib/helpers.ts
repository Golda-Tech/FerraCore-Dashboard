/**
 * Auto-detect Ghana mobile-money network provider from MSISDN prefix.
 *
 * Accepts a **local 9-digit number** (without the leading 0 or country code).
 * For example, if the full number is 0244123456 or 233244123456, pass "244123456".
 *
 * Returns one of: "MTN" | "VOD" | "AIR" | "GMO" | null
 */
export function detectNetworkProvider(
  localNumber: string
): "MTN" | "VOD" | "AIR" | "GMO" | null {
  if (!localNumber || localNumber.length < 2) return null;

  const prefix = localNumber.substring(0, 2);

  // MTN Ghana prefixes
  if (["24", "25", "53", "54", "55", "59"].includes(prefix)) return "MTN";

  // Telecel (formerly Vodafone) prefixes
  if (["20", "50"].includes(prefix)) return "VOD";

  // AirtelTigo prefixes
  if (["26", "27", "56", "57"].includes(prefix)) return "AIR";

  // G-Money (GCB Bank) prefix
  if (["23"].includes(prefix)) return "GMO";

  return null;
}

/**
 * Map a standard provider code ("MTN" | "VOD" | "AIR" | "GMO") to the
 * lowercase radio-group value used in request-payment-content.
 *
 * "MTN"  → "mtn"
 * "VOD"  → "telecelcash"
 * "AIR"  → "airteltigo"
 * "GMO"  → "g-money"
 */
export function providerCodeToRadioValue(
  code: "MTN" | "VOD" | "AIR" | "GMO" | null
): string | null {
  if (!code) return null;
  const map: Record<string, string> = {
    MTN: "mtn",
    VOD: "telecelcash",
    AIR: "airteltigo",
    GMO: "g-money",
  };
  return map[code] ?? null;
}

/**
 * Map a radio-group value back to the standard provider code
 * expected by the API: "MTN" | "VOD" | "AIR" | "GMO".
 *
 * "mtn"         → "MTN"
 * "telecelcash" → "VOD"
 * "airteltigo"  → "AIR"
 * "g-money"     → "GMO"
 */
export function radioValueToProviderCode(
  radioValue: string
): string {
  const map: Record<string, string> = {
    mtn: "MTN",
    telecelcash: "VOD",
    airteltigo: "AIR",
    "g-money": "GMO",
  };
  return map[radioValue] ?? radioValue.toUpperCase();
}

