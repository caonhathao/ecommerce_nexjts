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

  //admin's api
  cateogry: {
    fetch_all: '/api/manager/category',
    fetch_form: '/api/manager/category/form',
    create: '/api/manager/category',
    del_one: (id: string) => `/api/manager/category?id=${id}`,
  },
};
