import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { ShippingListMethodsPayloadFragment } from "../../../../generated/graphql";
import { CheckoutShippingMethodService } from "../../../checkout-shipping-method.service";
import { getEnvConfig } from "../../../env-config";
import { logger } from "../../../lib/logger";
import { saleorToShippo } from "../../../modules/shippo/saleor-to-shippo";
import { ShippoApiClient } from "../../../modules/shippo/api/shippo-api-client";
import { saleorApp } from "../../../saleor-app";

const CheckoutLine = gql`
  fragment CheckoutLine on CheckoutLine {
    id
    variant {
      weight {
        unit
        value
      }
      product {
        packageSize: attribute(slug: "package-size") {
          values {
            slug
          }
        }
      }
    }
  }
`;

const ShippingListMethodsPayload = gql`
  ${CheckoutLine}
  fragment ShippingListMethodsPayload on ShippingListMethodsForCheckout {
    checkout {
      lines {
        ...CheckoutLine
      }
      shippingAddress {
        firstName
        lastName
        companyName
        streetAddress1
        streetAddress2
        city
        countryArea
        postalCode
        country {
          code
        }
        phone
      }
      deliveryMethod {
        ... on ShippingMethod {
          id
          name
        }
      }
    }
  }
`;

const ShippingListMethodsForCheckoutSubscription = gql`
  ${ShippingListMethodsPayload}
  subscription ShippingListMethodsForCheckout {
    event {
      ...ShippingListMethodsPayload
    }
  }
`;

export const shippingListMethodsForCheckoutWebhook =
  new SaleorSyncWebhook<ShippingListMethodsPayloadFragment>({
    name: "Shipping List Methods for Checkout",
    webhookPath: "api/webhooks/shipping-list-methods-for-checkout",
    event: "SHIPPING_LIST_METHODS_FOR_CHECKOUT",
    apl: saleorApp.apl,
    query: ShippingListMethodsForCheckoutSubscription,
  });

export default shippingListMethodsForCheckoutWebhook.createHandler(async (req, res, ctx) => {
  const { payload } = ctx;
  logger.info(payload, "Shipping List Methods for Checkout Webhook called with: ");

  const env = getEnvConfig();
  const apiClient = new ShippoApiClient(env.SHIPPO_API_KEY);

  try {
    const checkout = payload.checkout;

    if (!checkout) {
      throw new Error("No checkout found in payload");
    }

    const shippingAddress = checkout.shippingAddress;

    if (!shippingAddress) {
      throw new Error("No shipping address found in checkout");
    }

    if (!shippingAddress.postalCode || !shippingAddress.streetAddress1 || !shippingAddress.city) {
      throw new Error("Shipping address is incomplete for Shippo rate request");
    }

    const checkoutService = new CheckoutShippingMethodService(apiClient);

    const saleorShippingMethods = await checkoutService.getShippingMethodsForCheckout({
      lines: checkout.lines,
      addressFrom: env.addressFrom,
      addressTo: saleorToShippo.mapSaleorAddressToShippo(shippingAddress),
      carrierAccountIds: env.CARRIER_ACCOUNT_IDS,
    });

    logger.debug({ saleorShippingMethods }, "Responding to Saleor with shipping methods: ");

    return res.status(200).json(saleorShippingMethods);
  } catch (error) {
    logger.error(error, "Error fetching shipping methods");

    return res.status(500).json({ error: "Error fetching shipping methods" });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};
