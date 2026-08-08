import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Input, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useEffect, useState } from "react";

const AddToSaleorForm = () => (
  <Box
    as={"form"}
    display={"flex"}
    alignItems={"center"}
    gap={4}
    onSubmit={(event) => {
      event.preventDefault();

      const saleorUrl = new FormData(event.currentTarget as HTMLFormElement).get("saleor-url");
      const manifestUrl = new URL("/api/manifest", window.location.origin);
      const redirectUrl = new URL(
        `/dashboard/apps/install?manifestUrl=${manifestUrl}`,
        saleorUrl as string
      ).href;

      window.open(redirectUrl, "_blank");
    }}
  >
    <Input type="url" required label="Saleor URL" name="saleor-url" />
    <Button type="submit">Add to Saleor</Button>
  </Box>
);

/**
 * This is page publicly accessible from your app.
 * You should probably remove it.
 */
const IndexPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLocalHost = global.location.href.includes("localhost");

  return (
    <Box padding={8}>
      <Text variant={"hero"}>Welcome to GoShippo 📦</Text>
      <Text as={"p"} marginY={4}>
        This Saleor app uses Shippo to return live shipping rates on checkout via
        SHIPPING_LIST_METHODS_FOR_CHECKOUT.
      </Text>
      {appBridgeState?.ready && mounted && (
        <Text as={"p"}>
          The app is installed and active. Shipping rates are served automatically to checkout via
          the SHIPPING_LIST_METHODS_FOR_CHECKOUT webhook — no further configuration is required
          here.
        </Text>
      )}

      {mounted && !isLocalHost && !appBridgeState?.ready && (
        <>
          <Text marginBottom={4} as={"p"}>
            Install this app in your Dashboard and get extra powers!
          </Text>
          <AddToSaleorForm />
        </>
      )}
    </Box>
  );
};

export default IndexPage;
