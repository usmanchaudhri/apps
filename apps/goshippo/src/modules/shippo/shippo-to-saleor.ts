import { SaleorShippingMethod } from "../../lib/types";
import { ShippoRate } from "./types";

const mapShippoRates = (rates: ShippoRate[]): SaleorShippingMethod[] => {
  return rates.map((rate) => {
    const serviceName = rate.servicelevel?.name?.trim() || "Shipping";
    const serviceToken = rate.servicelevel?.token?.trim();

    return {
      id: serviceToken || rate.objectId,
      name: `${rate.provider} ${serviceName}`.trim(),
      amount: Number.parseFloat(rate.amount),
      currency: rate.currency,
    };
  });
};

export const shippoToSaleor = {
  mapShippoRates,
};
