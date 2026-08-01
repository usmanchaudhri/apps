import { CheckoutLineFragment, WeightUnitsEnum } from "../../../generated/graphql";
import { createLogger } from "../../lib/logger";
import { notEmpty } from "../../lib/not-empty";
import {
  Dimensions,
  PackageDimensionsMap,
  PackageType,
  PackageTypeSummary,
  ShippoAddress,
  Weight,
  WeightUnits,
} from "./types";

const logger = createLogger("saleorToShippo");

/**
 * Sum Saleor line weights into a Shippo parcel weight.
 *
 * Assumptions:
 * - If no weights are found, returns 0 grams
 * - KG is converted to grams
 * - Unsupported units throw
 * - All provided weights share the same unit
 */
const mapSaleorLinesToWeight = (lines: CheckoutLineFragment[]): Weight => {
  const weights = lines.map((line) => line.variant.weight).filter(notEmpty);

  if (weights.length === 0) {
    logger.trace("No weights found, returning 0 grams");

    return {
      value: 0,
      units: WeightUnits.Grams,
    };
  }

  let unit = weights[0].unit;
  let value = weights.reduce((acc, weight) => acc + weight.value, 0);

  if (unit === "KG") {
    value = value * 1000;
    unit = WeightUnitsEnum.G;
  }

  const weightMap: Record<WeightUnitsEnum, WeightUnits | undefined> = {
    G: WeightUnits.Grams,
    KG: undefined,
    LB: WeightUnits.Pounds,
    OZ: WeightUnits.Ounces,
    TONNE: undefined,
  };

  const convertedUnit = weightMap[unit];

  if (convertedUnit === undefined) {
    throw new Error(`${unit} is not a supported weight unit`);
  }

  return {
    value,
    units: convertedUnit,
  };
};

export const summaryCheckoutLinesPackageTypes = (
  lines: CheckoutLineFragment[]
): PackageTypeSummary => {
  const packageTypesCounter: PackageTypeSummary = {
    envelope: 0,
    smallBox: 0,
    largeBox: 0,
  };

  lines.forEach((line) => {
    const packageSize = line.variant.product?.packageSize?.values[0]?.slug;

    switch (packageSize) {
      case "smallBox":
        packageTypesCounter.smallBox++;
        break;
      case "largeBox":
        packageTypesCounter.largeBox++;
        break;
      default:
        packageTypesCounter.envelope++;
        break;
    }
  });

  return packageTypesCounter;
};

export const choosePackageType = (packageTypes: PackageTypeSummary): PackageType => {
  if (packageTypes.envelope <= 5 && packageTypes.smallBox === 0 && packageTypes.largeBox === 0) {
    return "envelope";
  }

  if (packageTypes.envelope <= 20 && packageTypes.smallBox <= 5 && packageTypes.largeBox === 0) {
    return "smallBox";
  }

  return "largeBox";
};

export const mapSaleorLinesToPackageDimensions = (lines: CheckoutLineFragment[]): Dimensions => {
  const summary = summaryCheckoutLinesPackageTypes(lines);
  const packageType = choosePackageType(summary);

  return PackageDimensionsMap[packageType];
};

export const mapSaleorAddressToShippo = (address: {
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  streetAddress1?: string | null;
  streetAddress2?: string | null;
  city?: string | null;
  countryArea?: string | null;
  postalCode?: string | null;
  country: { code: string };
  phone?: string | null;
}): ShippoAddress => {
  const name = [address.firstName, address.lastName].filter(Boolean).join(" ").trim();

  return {
    name: name || address.companyName || "Customer",
    street1: address.streetAddress1 || "",
    street2: address.streetAddress2 || undefined,
    city: address.city || "",
    state: address.countryArea || undefined,
    zip: address.postalCode || "",
    country: address.country.code,
    phone: address.phone || undefined,
  };
};

export const saleorToShippo = {
  mapSaleorLinesToWeight,
  summaryCheckoutLinesPackageTypes,
  choosePackageType,
  mapSaleorLinesToPackageDimensions,
  mapSaleorAddressToShippo,
};
