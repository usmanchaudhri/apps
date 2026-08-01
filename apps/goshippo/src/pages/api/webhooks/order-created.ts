import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { OrderCreatedWebhookPayloadFragment } from "../../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";

const OrderCreatedWebhookPayload = gql`
  fragment OrderCreatedWebhookPayload on OrderCreated {
    order {
      id
      number
      metadata {
        key
        value
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

const OrderCreatedGraphqlSubscription = gql`
  ${OrderCreatedWebhookPayload}
  subscription OrderCreated {
    event {
      ...OrderCreatedWebhookPayload
    }
  }
`;

export const orderCreatedWebhook = new SaleorAsyncWebhook<OrderCreatedWebhookPayloadFragment>({
  name: "Order Created in Saleor",
  webhookPath: "api/webhooks/order-created",
  event: "ORDER_CREATED",
  apl: saleorApp.apl,
  query: OrderCreatedGraphqlSubscription,
});

export default orderCreatedWebhook.createHandler((req, res, ctx) => {
  const { payload } = ctx;
  console.log("Order created with: ", payload);

  // Next step: purchase a Shippo label for the selected rate.
  // https://docs.goshippo.com/docs/stories/single_rating_guide/
  //
  // Decode the Saleor shipping method ID (app:saleor.app.goshippo:<servicelevel.token>)
  // then create a Shippo transaction from the matching rate object_id.

  res.status(200).end();
});

export const config = {
  api: {
    bodyParser: false,
  },
};
