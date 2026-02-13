// Change to your machine IP when testing on device (e.g. 'http://192.168.0.121:5000')
export const BASE_URL = 'http://localhost:5000';

export const API_URLS = {
  // Auth
  Register: `${BASE_URL}/api/auth/register`,
  Login: `${BASE_URL}/api/auth/login`,
  ForgotPassword: `${BASE_URL}/api/auth/forgot-password`,
  ResetPassword: `${BASE_URL}/api/auth/reset-password`,
  ChangePassword: `${BASE_URL}/api/auth/change-password`,

  // Shops
  Shops: `${BASE_URL}/api/shops`,
  ShopById: (id) => `${BASE_URL}/api/shops/${id}`,

  // Users
  Users: `${BASE_URL}/api/users`,
  UserById: (id) => `${BASE_URL}/api/users/${id}`,

  // Help / Complaints
  Help: `${BASE_URL}/api/help`,

  // Health
  Health: `${BASE_URL}/health`,
};
