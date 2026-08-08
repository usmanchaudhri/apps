import { describe, expect, it } from "vitest";
import { shippoToSaleor } from "./shippo-to-saleor";
import { ShippoRate } from "./types";

const rate = (overrides: Partial<ShippoRate> = {}): ShippoRate => ({
  objectId: "obj_default",
  amount: "10.00",
  currency: "USD",
  provider: "USPS",
  servicelevel: { name: "Priority Mail", token: "usps_priority" },
  estimatedDays: 3,
  ...overrides,
});

describe("shippoToSaleor", () => {
  describe("mapShippoRates", () => {
    it("should include carrier, service level and speed tier in the name", () => {
      const result = shippoToSaleor.mapShippoRates([
        rate({ provider: "USPS", servicelevel: { name: "Priority Mail" }, estimatedDays: 3 }),
      ]);

      expect(result[0].name).toBe("USPS Priority Mail (Expedited)");
    });

    it("should label fast rates as Express and slow rates as Standard", () => {
      const [express, standard] = shippoToSaleor
        .mapShippoRates([
          rate({ objectId: "a", amount: "30.00", estimatedDays: 1 }),
          rate({ objectId: "b", amount: "40.00", estimatedDays: 7 }),
        ])
        .sort((first, second) => first.amount - second.amount);

      expect(express.name).toContain("(Express)");
      expect(standard.name).toContain("(Standard)");
    });

    it("should sort methods by price, cheapest first", () => {
      const result = shippoToSaleor.mapShippoRates([
        rate({ objectId: "a", servicelevel: { name: "A" }, amount: "30.00" }),
        rate({ objectId: "b", servicelevel: { name: "B" }, amount: "10.00" }),
        rate({ objectId: "c", servicelevel: { name: "C" }, amount: "20.00" }),
      ]);

      expect(result.map((method) => method.amount)).toEqual([10, 20, 30]);
    });

    it("should deduplicate methods with the same name, price and currency", () => {
      const result = shippoToSaleor.mapShippoRates([
        rate({ objectId: "a" }),
        rate({ objectId: "b" }),
      ]);

      expect(result).toHaveLength(1);
    });

    it("should forward the estimated transit time as delivery days", () => {
      const result = shippoToSaleor.mapShippoRates([rate({ estimatedDays: 5 })]);

      expect(result[0].minimum_delivery_days).toBe(5);
      expect(result[0].maximum_delivery_days).toBe(5);
    });

    it("should fall back to the object id when the service level token is missing", () => {
      const result = shippoToSaleor.mapShippoRates([
        rate({ objectId: "obj_123", servicelevel: { name: "Ground" } }),
      ]);

      expect(result[0].id).toBe("obj_123");
    });
  });
});
