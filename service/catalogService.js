import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URLS } from './config';

const TOKEN_KEY = '@gold_token';

const getAuthHeaders = async (json = true) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const headers = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const getCatalogSubscriptionStatus = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(API_URLS.CatalogSubscriptionStatus, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to check subscription status');
  return data.data;
};

export const getMyCatalogs = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(API_URLS.CatalogMy, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load catalogs');
  return data.data;
};

export const createCatalog = async (payload) => {
  const headers = await getAuthHeaders();
  const res = await fetch(API_URLS.CatalogCreate, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create catalog');
  return data.data;
};

export const getCatalogImages = async (catalogId) => {
  const headers = await getAuthHeaders();
  const res = await fetch(API_URLS.CatalogImages(catalogId), { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load images');
  return data.data;
};

export const uploadCatalogImage = async (catalogId, formData) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(API_URLS.CatalogImages(catalogId), {
    method: 'POST',
    headers,
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to upload image');
  return data.data;
};

/**
 * Bulk upload up to 10 images.
 * assets: array of { uri, type, fileName }
 * quality: 'standard' | 'hd'
 * metaList: array of { title, description, price } aligned with assets
 */
export const bulkUploadCatalogImages = async (catalogId, assets, quality, metaList = []) => {
  const token = await AsyncStorage.getItem('@gold_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const formData = new FormData();
  formData.append('quality', quality);
  assets.forEach((asset, i) => {
    formData.append('images', {
      uri: asset.uri,
      type: asset.type || 'image/jpeg',
      name: asset.fileName || `image_${i}.jpg`,
    });
    const meta = metaList[i] || {};
    if (meta.title)       formData.append('titles',        meta.title);
    if (meta.description) formData.append('descriptions',  meta.description);
    if (meta.price != null && meta.price !== '') formData.append('prices', String(meta.price));
  });
  const res = await fetch(API_URLS.CatalogImagesBulk(catalogId), {
    method: 'POST',
    headers,
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Bulk upload failed');
  return data;
};

export const deleteCatalogImage = async (catalogId, imageId) => {
  const headers = await getAuthHeaders();
  const res = await fetch(API_URLS.CatalogDeleteImage(catalogId, imageId), {
    method: 'DELETE',
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete image');
  return data;
};

export const getPublicCatalog = async (catalogId) => {
  const res = await fetch(API_URLS.PublicCatalog(catalogId));
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Catalog not found');
  return data.data;
};

export const getPublicCatalogsByTenant = async (tenantId, tenantType) => {
  const url = tenantType
    ? `${API_URLS.PublicCatalogsByTenant(tenantId)}?tenantType=${tenantType}`
    : API_URLS.PublicCatalogsByTenant(tenantId);
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load catalogs');
  return data.data;
};
