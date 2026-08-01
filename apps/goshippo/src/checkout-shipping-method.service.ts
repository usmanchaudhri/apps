import { CheckoutLineFragment } from "../generated/graphql";
import { createLogger } from "./lib/logger";
import { SaleorShippingMethod } from "./lib/types";
import { ShippoApiClient } from "./modules/shippo/api/shippo-api-client";
import { saleorToShippo } from "./modules/shippo/saleor-to-shippo";
import { shippoToSaleor } from "./modules/shippo/shippo-to-saleor";
import { ShippoAddress } from "./modules/shippo/types";

export class CheckoutShippingMethodService {
  private logger = createLogger("CheckoutShippingMethodService");

  constructor(private apiClient: ShippoApiClient) {}

  async getShippingMethodsForCheckout({
    lines,
    addressFrom,
    addressTo,
    carrierAccountIds,
  }: {
    lines: CheckoutLineFragment[];
    addressFrom: ShippoAddress;
    addressTo: ShippoAddress;
    carrierAccountIds?: string[];
  }): Promise<SaleorShippingMethod[]> {
    this.logger.debug("Getting Shippo rates for checkout");

    const rates = await this.apiClient.getRatesForShipment({
      addressFrom,
      addressTo,
      weight: saleorToShippo.mapSaleorLinesToWeight(lines),
      dimensions: saleorToShippo.mapSaleorLinesToPackageDimensions(lines),
      carrierAccountIds,
    });

    this.logger.debug({ ratesCount: rates.length }, "Shippo rates received");

    return shippoToSaleor.mapShippoRates(rates);
  }
}
