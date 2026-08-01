// Loads configuration from environment variables and throws if required values are missing.
// TODO: migrate to t3-env

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

const FROM_STATE = process.env.FROM_STATE || undefined;
const FROM_STREET2 = process.env.FROM_STREET2 || undefined;
const FROM_PHONE = process.env.FROM_PHONE || undefined;
const FROM_EMAIL = process.env.FROM_EMAIL || undefined;

/** Optional comma-separated Shippo carrier account object IDs. Empty = all connected carriers. */
const rawCarrierAccountIds = process.env.CARRIER_ACCOUNT_IDS?.trim();
const CARRIER_ACCOUNT_IDS = rawCarrierAccountIds
  ? rawCarrierAccountIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  : [];

export const ENV_CONFIG = {
  SHIPPO_API_KEY,
  CARRIER_ACCOUNT_IDS,
  LOG_LEVEL,
  addressFrom: {
    name: FROM_NAME,
    street1: FROM_STREET1,
    street2: FROM_STREET2,
    city: FROM_CITY,
    state: FROM_STATE,
    zip: FROM_ZIP,
    country: FROM_COUNTRY,
    phone: FROM_PHONE,
    email: FROM_EMAIL,
  },
};
