export const paths = {
  home: '/',
  login: '/login',

  products: {
    detail_id: (id: string) => `/products/${id}`,
    detail_slug: (slug: string) => `/products/slug/${slug}`,
  },

  orders: {
    order_detail_customer: (id: string) => `/customer/account/orders/${id}`,
  },

  messages: {
    message_detail: (id: string) => `/messages/${id}`,
    message_shop: (shopId: string) => `/seller/shops/${shopId}/messages`,
    message_detail_shop: (shopId: string, conversationId: string) =>
      `/seller/shops/${shopId}/messages/${conversationId}`,
  },

  seller: {
    shops: {
      create: '/seller/shops/create',
      edit: (shopId: string) => `/seller/shops/${shopId}/edit`,
    },
  },
};
