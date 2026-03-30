/** Serializable props for account area tables (orders, tutorials list). */

import type { OrderShipmentSummary } from "lib/order-shipment";
import type { OrderShippingAddressSummary } from "lib/order-shipping-address";

export type AccountOrderLineItem = {
  id: number;
  title: string;
  quantity: number;
  productSlug: string | null;
};

export type AccountOrderListRow = {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string | null;
  lineItems: AccountOrderLineItem[];
  shipment: OrderShipmentSummary | null;
  shippingAddress: OrderShippingAddressSummary | null;
};

export type AccountTutorialListRow = {
  slug: string;
  title: string;
};
