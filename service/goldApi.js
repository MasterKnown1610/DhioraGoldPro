/**
 * Gold API client. All endpoints require Authorization: Bearer <token>.
 * Backend returns { success, message, data }.
 */

import { API_URLS } from './config';

function getHeaders(token) {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * GET /api/gold/wallet - balance, ads today, remaining ads, transactions (paginated).
 * @param {string} token - JWT
 * @param {{ page?: number, limit?: number }} [params]
 */
export async function getWallet(token, params = {}) {
  const q = new URLSearchParams();
  if (params.page != null) q.set('page', String(params.page));
  if (params.limit != null) q.set('limit', String(params.limit));
  const url = `${API_URLS.GoldWallet}${q.toString() ? `?${q.toString()}` : ''}`;
  const res = await fetch(url, { headers: getHeaders(token) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to load wallet');
  return json;
}

/**
 * POST /api/gold/unlock-phone - spend 2 gold.
 */
export async function unlockPhone(token) {
  const res = await fetch(API_URLS.GoldUnlockPhone, {
    method: 'POST',
    headers: getHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Unlock failed');
  return json;
}

/**
 * POST /api/gold/boost-shop - spend 10 gold, set shop boostExpires.
 */
export async function boostShop(token) {
  const res = await fetch(API_URLS.GoldBoostShop, {
    method: 'POST',
    headers: getHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Boost failed');
  return json;
}

/**
 * POST /api/gold/remove-ads - spend 5 gold, set user adFreeUntil.
 */
export async function removeAds(token) {
  const res = await fetch(API_URLS.GoldRemoveAds, {
    method: 'POST',
    headers: getHeaders(token),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Remove ads failed');
  return json;
}
