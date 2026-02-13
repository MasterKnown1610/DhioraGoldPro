import { useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URLS } from '../../service/config';
import Reducer from './reducer';
import { ShopsActions } from './action';

const TOKEN_KEY = '@gold_token';

export const initialState = {
  shops: [],
  singleShop: null,
  pagination: null,
  loading: false,
  error: null,
};

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const ShopsState = () => {
  const [state, dispatch] = useReducer(Reducer, initialState);

  const getShops = async (params = {}) => {
    dispatch({ type: ShopsActions.SET_LOADING, payload: true });
    dispatch({ type: ShopsActions.SET_ERROR, payload: null });
    try {
      const q = new URLSearchParams(params).toString();
      const url = `${API_URLS.Shops}${q ? `?${q}` : ''}`;
      const headers = await getAuthHeader();
      const res = await fetch(url, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch shops');
      dispatch({ type: ShopsActions.SET_SHOPS, payload: data?.data ?? [] });
      dispatch({ type: ShopsActions.SET_PAGINATION, payload: data?.pagination ?? null });
      return data;
    } catch (e) {
      dispatch({ type: ShopsActions.SET_ERROR, payload: e.message });
      throw e;
    } finally {
      dispatch({ type: ShopsActions.SET_LOADING, payload: false });
    }
  };

  const getShopById = async (id) => {
    dispatch({ type: ShopsActions.SET_LOADING, payload: true });
    dispatch({ type: ShopsActions.SET_ERROR, payload: null });
    try {
      const headers = await getAuthHeader();
      const res = await fetch(API_URLS.ShopById(id), { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Shop not found');
      dispatch({ type: ShopsActions.SET_SINGLE_SHOP, payload: data?.data ?? null });
      return data;
    } catch (e) {
      dispatch({ type: ShopsActions.SET_ERROR, payload: e.message });
      throw e;
    } finally {
      dispatch({ type: ShopsActions.SET_LOADING, payload: false });
    }
  };

  const registerShop = async (formData) => {
    dispatch({ type: ShopsActions.SET_LOADING, payload: true });
    dispatch({ type: ShopsActions.SET_ERROR, payload: null });
    try {
      const headers = await getAuthHeader();
      const res = await fetch(API_URLS.Shops, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to register shop');
      return data;
    } catch (e) {
      dispatch({ type: ShopsActions.SET_ERROR, payload: e.message });
      throw e;
    } finally {
      dispatch({ type: ShopsActions.SET_LOADING, payload: false });
    }
  };

  return {
    ...state,
    getShops,
    getShopById,
    registerShop,
  };
};
