const BASE_URL = "https://backend-luminan.onrender.com/";

export const API = {
  // Admin Endpoints (fixed to match backend)
  ADMIN_ORDERS: BASE_URL + "api/admin/orders/",
  ADMIN_ORDERS_DETAILS: BASE_URL + "api/admin/orders/details/",
  ADMIN_UPDATE_ORDER: (orderId) => BASE_URL + `api/admin/orders/${orderId}/update/`,
  ADMIN_UPDATE_UNIT_PRICE: (orderId) => BASE_URL + `api/admin/orders/${orderId}/update-unit-price/`,
  ADMIN_USERS: BASE_URL + "api/admin/users/",
  ADMIN_USERS_DETAILS: BASE_URL + "api/admin/users/details/",
  ADMIN_DELETE_USER: (userId) => BASE_URL + `api/admin/users/delete/${userId}`,
  ADMIN_DRIVERS_COUNT: BASE_URL + "api/admin/drivers/count/",
  ADMIN_DRIVERS: BASE_URL + "api/admin/drivers/",
  ADMIN_DRIVER_DETAILS: (driverId) => BASE_URL + `api/admin/drivers/${driverId}/`,
  ADMIN_ORDERS_REVENUE: BASE_URL + "api/admin/orders/revenue/",
  ADMIN_SALES_VOLUME: BASE_URL + "api/admin/sales/volume/",
  ADMIN_UPDATE_GLOBAL_PRICE: BASE_URL + "admin/global-price/update/",
  // WebSocket for real-time driver tracking
  WS_ADMIN_DRIVERS: "wss://backend-luminan.onrender.com/ws/admin/drivers/",
};
