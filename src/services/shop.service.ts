import { BaseServiceClass, METHOD } from "./base.service";

const service = new BaseServiceClass();

export type CartItemInput = {
  variantId: number;
  title: string;
  quantity: number;
  unitPrice: number;
};

export const ShopService = Object.freeze({
  listProducts(query = "") {
    return service.fetchHelper(`api/products${query}`, METHOD.GET);
  },

  getProductBySlug(slug: string) {
    return service.fetchHelper(
      `api/products?filters[slug][$eq]=${slug}&populate[variants][populate]=inventory&populate=cover`,
      METHOD.GET
    );
  },

  createCheckoutSession(payload: {
    orderId: number;
    orderNumber: string;
    lineItems: CartItemInput[];
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
  }) {
    return service.fetchHelper("api/shop/checkout", METHOD.POST, payload);
  },

  getOpsMetrics() {
    return service.fetchHelper("api/shop/ops/metrics", METHOD.GET);
  },
});
