export const paths = {
  home: '/',
  login: '/auth/login',
  verify_request: '/auth/verify-request',

  products: {
    detail_id: (id: string) => `/products/${id}`,
    detail_slug: (slug: string) => `/products/slug/${slug}`,
  },

  orders: {
    order_detail_customer: (id: string) => `/customer/account/orders/${id}`,
  },

  messages: {
    message_detail: (id: string) => `/messages/${id}`,
    message_detail_shop: (shopId: string, conversationId: string) =>
      `/seller/shops/${shopId}/messages/${conversationId}`,
  },

  //admin's api
  manager: {
    category: {
      search: '/api/manager/category/search',
      fetch_all: '/api/manager/category',
      fetch_form: '/api/manager/category/form',
      fetch_detail: (id: string) => `/api/manager/category/query?id=${id}`,
      create: '/api/manager/category',
      update: '/api/manager/category',
      del_one: (id: string) => `/api/manager/category?id=${id}`,
    },
    product: {
      search: '/api/manager/product/search',
      update: '/api/manager/product',
      fetch_all: '/api/manager/product',
      fetch_detail: '/api/manager/product/query',
    },
    shop: {
      search: '/api/manager/shop/search',
      fetch_all: '/api/manager/shop',
      fetch_detail: `/api/manager/shop/query`,
      update: '/api/manager/shop',
    },
    user: {
      search: '/api/manager/user/search',
      fetch_all: '/api/manager/user',
      fetch_detail: `/api/manager/user/query`,
    },
  },

  reviews: {
    fetch_all: '/api/reviews',
  },

  shop: {
    fetch_all: '/api/product/query',
    accept_invite: (token: string) => '/shop/accept-invite/' + token,
  },

  seller: {
    shops: {
      dashboard: '/seller/shops',
      create: '/seller/shops/create',
      edit: (shopId: string) => `/seller/shops/${shopId}/edit`,
      message_shop: (shopId: string) => `/seller/shops/${shopId}/messages`,
      members: (shopId: string) => `/seller/shops/${shopId}/members`,
    },
  },
};
