// Loads configuration from environment variables.
// Validated lazily so Next.js build can import this module without Railway env vars present at build time.

export type EnvConfig = {
  SHIPPO_API_KEY: string;
  CARRIER_ACCOUNT_IDS: string[];
  LOG_LEVEL: string;
  addressFrom: {
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state?: string;
    zip: string;
    country: string;
    phone?: string;
    email?: string;
  };
};

let cachedConfig: EnvConfig | null = null;

export function getEnvConfig(): EnvConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const LOG_LEVEL = process.env.LOG_LEVEL || "info";

  const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY;
  if (!SHIPPO_API_KEY) {
    throw new Error(
      "SHIPPO_API_KEY is not defined. Use a Shippo API token from https://portal.goshippo.com/ (shippo_test_… for test mode)."
    );
  }

  const FROM_NAME = process.env.FROM_NAME;
  const FROM_STREET1 = process.env.FROM_STREET1;
  const FROM_CITY = process.env.FROM_CITY;
  const FROM_ZIP = process.env.FROM_ZIP;
  const FROM_COUNTRY = process.env.FROM_COUNTRY;

  if (!FROM_NAME || !FROM_STREET1 || !FROM_CITY || !FROM_ZIP || !FROM_COUNTRY) {
    throw new Error(
      "Shippo origin address is incomplete. Set FROM_NAME, FROM_STREET1, FROM_CITY, FROM_ZIP, and FROM_COUNTRY."
    );
  }

  const rawCarrierAccountIds = process.env.CARRIER_ACCOUNT_IDS?.trim();
  const CARRIER_ACCOUNT_IDS = rawCarrierAccountIds
    ? rawCarrierAccountIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    : [];

  cachedConfig = {
    SHIPPO_API_KEY,
    CARRIER_ACCOUNT_IDS,
    LOG_LEVEL,
    addressFrom: {
      name: FROM_NAME,
      street1: FROM_STREET1,
      street2: process.env.FROM_STREET2 || undefined,
      city: FROM_CITY,
      state: process.env.FROM_STATE || undefined,
      zip: FROM_ZIP,
      country: FROM_COUNTRY,
      phone: process.env.FROM_PHONE || undefined,
      email: process.env.FROM_EMAIL || undefined,
    },
  };

  return cachedConfig;
}

/** @deprecated Prefer getEnvConfig() so imports stay safe at build time. */
export const ENV_CONFIG = new Proxy({} as EnvConfig, {
  get(_target, prop, receiver) {
    return Reflect.get(getEnvConfig(), prop, receiver);
  },
});
