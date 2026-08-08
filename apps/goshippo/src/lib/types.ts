export interface SaleorShippingMethod {
  id: string;
  name: string;
  amount: number;
  currency: string;
  /**
   * Saleor's shipping webhook accepts snake_case delivery-day estimates.
   * The storefront renders these as an "X-Y business days" hint.
   */
  minimum_delivery_days?: number;
  maximum_delivery_days?: number;
}
