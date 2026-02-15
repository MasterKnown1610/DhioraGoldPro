// Change to your machine IP when testing on device (e.g. 'http://192.168.0.121:5000')
export const BASE_URL = 'https://dhiora-gold-backend.vercel.app';

export const API_URLS = {
  // Auth
  Register: `${BASE_URL}/api/auth/register`,
  Login: `${BASE_URL}/api/auth/login`,
  Me: `${BASE_URL}/api/auth/me`,
  RegisterServiceProvider: `${BASE_URL}/api/auth/register-service-provider`,
  UpdateServiceProvider: `${BASE_URL}/api/auth/service-provider`,
  RegisterShop: `${BASE_URL}/api/auth/register-shop`,
  UpdateShop: `${BASE_URL}/api/auth/shop`,
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

  // Promotions (returns only active: endDate >= today)
  Promotions: `${BASE_URL}/api/promotions`,

  // Health
  Health: `${BASE_URL}/health`,
};
