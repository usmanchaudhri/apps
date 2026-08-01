import { describe, expect, it } from "vitest";
import { saleorToShippo } from "./saleor-to-shippo";
import { CheckoutLineFragment, WeightUnitsEnum } from "../../../generated/graphql";
import { PackageType, WeightUnits } from "./types";

const dummyLineWithSizeAttribute = (size: PackageType): CheckoutLineFragment => ({
  id: "dummy",
  variant: {
    weight: {
      unit: WeightUnitsEnum.G,
      value: 1,
    },
    product: {
      packageSize: {
        values: [
          {
            slug: size,
          },
        ],
      },
    },
  },
});

describe("saleorToShippo", () => {
  describe("mapSaleorLinesToWeight", () => {
    it("should map Saleor g lines to weight in grams", () => {
      const lines: CheckoutLineFragment[] = [
        {
          id: "1",
          variant: {
            weight: {
              unit: WeightUnitsEnum.G,
              value: 1,
            },
            product: {
              packageSize: {
                values: [{ slug: "small" }],
              },
            },
          },
        },
      ];

      expect(saleorToShippo.mapSaleorLinesToWeight(lines)).toEqual({
        value: 1,
        units: WeightUnits.Grams,
      });
    });

    it("should map Saleor kg lines to weight in grams", () => {
      const lines: CheckoutLineFragment[] = [
        {
          id: "1",
          variant: {
            weight: {
              unit: WeightUnitsEnum.Kg,
              value: 1,
            },
            product: {
              packageSize: {
                values: [{ slug: "small" }],
              },
            },
          },
        },
      ];

      expect(saleorToShippo.mapSaleorLinesToWeight(lines)).toEqual({
        value: 1000,
        units: WeightUnits.Grams,
      });
    });

    it("should map Saleor lines with no variant.weight to zero weight", () => {
      const lines: CheckoutLineFragment[] = [
        {
          id: "1",
          variant: {
            product: {
              packageSize: {
                values: [{ slug: "small" }],
              },
            },
          },
        },
      ];

      expect(saleorToShippo.mapSaleorLinesToWeight(lines)).toEqual({
        value: 0,
        units: WeightUnits.Grams,
      });
    });

    it("should throw an error if the weight unit is not supported", () => {
      const lines: CheckoutLineFragment[] = [
        {
          id: "1",
          variant: {
            weight: {
              unit: WeightUnitsEnum.Tonne,
              value: 1,
            },
            product: {
              packageSize: {
                values: [{ slug: "small" }],
              },
            },
          },
        },
      ];

      expect(() => saleorToShippo.mapSaleorLinesToWeight(lines)).toThrowError(
        "TONNE is not a supported weight unit"
      );
    });
  });

  describe("summaryCheckoutLinesPackageTypes", () => {
    it("should return zeros when no lines are provided", () => {
      expect(saleorToShippo.summaryCheckoutLinesPackageTypes([])).toEqual({
        envelope: 0,
        smallBox: 0,
        largeBox: 0,
      });
    });

    it("should treat item types as envelopes when no package attributes were assigned", () => {
      const lines: CheckoutLineFragment[] = [
        {
          id: "1",
          variant: {
            weight: { unit: WeightUnitsEnum.G, value: 1 },
            product: { packageSize: { values: [] } },
          },
        },
        {
          id: "2",
          variant: {
            weight: { unit: WeightUnitsEnum.G, value: 1 },
            product: { packageSize: { values: [] } },
          },
        },
      ];

      expect(saleorToShippo.summaryCheckoutLinesPackageTypes(lines)).toEqual({
        envelope: 2,
        smallBox: 0,
        largeBox: 0,
      });
    });

    it("should return one envelope, two small, 4 large boxes", () => {
      const lines: CheckoutLineFragment[] = [
        dummyLineWithSizeAttribute("envelope"),
        dummyLineWithSizeAttribute("smallBox"),
        dummyLineWithSizeAttribute("smallBox"),
        dummyLineWithSizeAttribute("largeBox"),
        dummyLineWithSizeAttribute("largeBox"),
        dummyLineWithSizeAttribute("largeBox"),
        dummyLineWithSizeAttribute("largeBox"),
      ];

      expect(saleorToShippo.summaryCheckoutLinesPackageTypes(lines)).toEqual({
        envelope: 1,
        smallBox: 2,
        largeBox: 4,
      });
    });
  });

  describe("mapSaleorLinesToPackageDimensions", () => {
    it("return envelope dimensions", () => {
      expect(
        saleorToShippo.mapSaleorLinesToPackageDimensions([dummyLineWithSizeAttribute("envelope")])
      ).toEqual({
        height: 1,
        length: 30,
        width: 20,
        units: "cm",
      });
    });
  });

  describe("mapSaleorAddressToShippo", () => {
    it("maps Saleor address fields to Shippo address", () => {
      expect(
        saleorToShippo.mapSaleorAddressToShippo({
          firstName: "Ada",
          lastName: "Lovelace",
          streetAddress1: "965 Mission St",
          streetAddress2: "#572",
          city: "San Francisco",
          countryArea: "CA",
          postalCode: "94103",
          country: { code: "US" },
          phone: "4151234567",
        })
      ).toEqual({
        name: "Ada Lovelace",
        street1: "965 Mission St",
        street2: "#572",
        city: "San Francisco",
        state: "CA",
        zip: "94103",
        country: "US",
        phone: "4151234567",
      });
    });
  });
});
