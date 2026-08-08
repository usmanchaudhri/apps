import { Shippo } from "shippo";
import { createLogger } from "../../../lib/logger";
import { Dimensions, ShippoAddress, ShippoRate, Weight } from "../types";

export type CreateShipmentRatesInput = {
  addressFrom: ShippoAddress;
  addressTo: ShippoAddress;
  weight: Weight;
  dimensions: Dimensions;
  carrierAccountIds?: string[];
};

/**
 * Shippo client using the official Node SDK.
 * @see https://docs.goshippo.com/guides/client-libraries
 * @see https://docs.goshippo.com/docs/stories/single_rating_guide/
 */
export class ShippoApiClient {
  private logger = createLogger("ShippoApiClient");
  private shippo: Shippo;

  constructor(apiKey: string) {
    this.shippo = new Shippo({
      apiKeyHeader: apiKey,
    });
  }

  async getRatesForShipment(input: CreateShipmentRatesInput): Promise<ShippoRate[]> {
    this.logger.debug({ input }, "Creating Shippo shipment to fetch rates");

    const shipment = await this.shippo.shipments.create({
      addressFrom: {
        name: input.addressFrom.name,
        street1: input.addressFrom.street1,
        street2: input.addressFrom.street2,
        city: input.addressFrom.city,
        state: input.addressFrom.state,
        zip: input.addressFrom.zip,
        country: input.addressFrom.country,
        phone: input.addressFrom.phone,
        email: input.addressFrom.email,
      },
      addressTo: {
        name: input.addressTo.name,
        street1: input.addressTo.street1,
        street2: input.addressTo.street2,
        city: input.addressTo.city,
        state: input.addressTo.state,
        zip: input.addressTo.zip,
        country: input.addressTo.country,
        phone: input.addressTo.phone,
        email: input.addressTo.email,
      },
      parcels: [
        {
          length: String(input.dimensions.length),
          width: String(input.dimensions.width),
          height: String(input.dimensions.height),
          distanceUnit: input.dimensions.units,
          weight: String(input.weight.value),
          massUnit: input.weight.units,
        },
      ],
      async: false,
      ...(input.carrierAccountIds?.length ? { carrierAccounts: input.carrierAccountIds } : {}),
    });

    const rates = shipment.rates ?? [];

    this.logger.debug({ ratesCount: rates.length }, "Shippo rates received");

    return rates.map((rate) => ({
      objectId: rate.objectId,
      amount: rate.amount,
      currency: rate.currency,
      provider: rate.provider,
      servicelevel: {
        name: rate.servicelevel?.name,
        token: rate.servicelevel?.token,
      },
      estimatedDays: rate.estimatedDays,
      durationTerms: rate.durationTerms,
      attributes: rate.attributes,
    }));
  }
}
