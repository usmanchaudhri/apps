export enum WeightUnits {
  Grams = "g",
  Ounces = "oz",
  Pounds = "lb",
  Kilograms = "kg",
}

export interface Weight {
  value: number;
  units: WeightUnits;
}

export interface Dimensions {
  units: "in" | "cm";
  length: number;
  width: number;
  height: number;
}

export type PackageType = "envelope" | "smallBox" | "largeBox";

export type PackageTypeSummary = Record<PackageType, number>;

export const PackageDimensionsMap: Record<PackageType, Dimensions> = {
  envelope: { units: "cm", length: 30, width: 20, height: 1 },
  smallBox: { units: "cm", length: 30, width: 30, height: 30 },
  largeBox: { units: "cm", length: 50, width: 50, height: 50 },
};

export type ShippoAddress = {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
};

export type ShippoRateAttribute = "BESTVALUE" | "CHEAPEST" | "FASTEST";

export type ShippoRate = {
  objectId: string;
  amount: string;
  currency: string;
  provider: string;
  servicelevel: {
    name?: string | null;
    token?: string | null;
  };
  /** Estimated transit time in days, as provided by the carrier (not guaranteed). */
  estimatedDays?: number | null;
  /** Carrier-provided clarification of transit times. */
  durationTerms?: string | null;
  /** Shippo-assigned rate attributes within the shipment, e.g. CHEAPEST/FASTEST/BESTVALUE. */
  attributes?: ShippoRateAttribute[];
};
