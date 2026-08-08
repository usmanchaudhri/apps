import { SaleorShippingMethod } from "../../lib/types";
import { ShippoRate } from "./types";

/**
 * Derive a human-friendly speed tier from the carrier's estimated transit time.
 * The tier keywords are chosen so the storefront can pick a matching icon
 * (e.g. "Express" renders a clock icon).
 */
const getSpeedTier = (estimatedDays?: number | null): string => {
  if (estimatedDays == null) {
    return "Standard";
  }

  if (estimatedDays <= 2) {
    return "Express";
  }

  if (estimatedDays <= 4) {
    return "Expedited";
  }

  return "Standard";
};

const buildMethodName = (rate: ShippoRate): string => {
  const provider = rate.provider?.trim();
  const service = rate.servicelevel?.name?.trim();
  const tier = getSpeedTier(rate.estimatedDays);

  const label = [provider, service].filter(Boolean).join(" ") || "Shipping";

  return `${label} (${tier})`;
};

/**
 * Maps Shippo rates into Saleor shipping methods.
 *
 * - Names include the carrier + service level + a speed tier so customers can
 *   distinguish e.g. Express vs Standard options.
 * - Delivery-day estimates are forwarded so the storefront can show an ETA.
 * - Duplicate methods (same name + price) are collapsed.
 * - Methods are sorted by price, cheapest first.
 */
const mapShippoRates = (rates: ShippoRate[]): SaleorShippingMethod[] => {
  const seen = new Set<string>();

  return rates
    .map((rate) => {
      const estimatedDays = rate.estimatedDays ?? undefined;

      return {
        id: rate.servicelevel?.token?.trim() || rate.objectId,
        name: buildMethodName(rate),
        amount: Number.parseFloat(rate.amount),
        currency: rate.currency,
        minimum_delivery_days: estimatedDays,
        maximum_delivery_days: estimatedDays,
      };
    })
    .filter((method) => {
      const key = `${method.name}-${method.amount}-${method.currency}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    })
    .sort((a, b) => a.amount - b.amount);
};

export const shippoToSaleor = {
  mapShippoRates,
};
