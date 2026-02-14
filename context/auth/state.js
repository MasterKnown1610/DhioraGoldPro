import { useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URLS } from '../../service/config';
import Reducer from './reducer';
import { AuthActions } from './action';

const TOKEN_KEY = '@gold_token';
const USER_KEY = '@gold_user';

export const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const getHeaders = (json = true) => {
  const headers = {};
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
};

const getAuthHeaders = async () => {
  const headers = getHeaders();
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const AuthState = () => {
  const [state, dispatch] = useReducer(Reducer, initialState);

  const register = async (payload) => {
    dispatch({ type: AuthActions.SET_LOADING, payload: true });
    dispatch({ type: AuthActions.SET_ERROR, payload: null });
    try {
      const res = await fetch(API_URLS.Register, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      const token = data?.data?.token;
      const user = data?.data?.user;
      const userData = { ...user, userProfile: null, shopProfile: null };
      if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
      if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      dispatch({ type: AuthActions.SET_TOKEN, payload: token });
      dispatch({ type: AuthActions.SET_USER, payload: userData });
      return data;
    } catch (e) {
      dispatch({ type: AuthActions.SET_ERROR, payload: e.message });
      throw e;
    } finally {
      dispatch({ type: AuthActions.SET_LOADING, payload: false });
    }
  };

  const login = async (payload) => {
    dispatch({ type: AuthActions.SET_LOADING, payload: true });
    dispatch({ type: AuthActions.SET_ERROR, payload: null });
    try {
      const res = await fetch(API_URLS.Login, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      const token = data?.data?.token;
      const user = data?.data?.user;
      const userData = {
        ...user,
        userProfile: data?.data?.userProfile,
        shopProfile: data?.data?.shopProfile,
      };
      if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
      if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      dispatch({ type: AuthActions.SET_TOKEN, payload: token });
      dispatch({ type: AuthActions.SET_USER, payload: userData });
      return data;
    } catch (e) {
      dispatch({ type: AuthActions.SET_ERROR, payload: e.message });
      throw e;
    } finally {
      dispatch({ type: AuthActions.SET_LOADING, payload: false });
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    dispatch({ type: AuthActions.LOGOUT });
  };

  const restoreSession = async () => {
    try {
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);
      if (token) dispatch({ type: AuthActions.SET_TOKEN, payload: token });
      if (userStr) dispatch({ type: AuthActions.SET_USER, payload: JSON.parse(userStr) });
    } catch (_) {}
  };

  useEffect(() => {
    restoreSession();
  }, []);

  const forgotPassword = async (payload) => {
    dispatch({ type: AuthActions.SET_LOADING, payload: true });
    dispatch({ type: AuthActions.SET_ERROR, payload: null });
    try {
      const res = await fetch(API_URLS.ForgotPassword, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      return data;
    } catch (e) {
      dispatch({ type: AuthActions.SET_ERROR, payload: e.message });
      throw e;
    } finally {
      dispatch({ type: AuthActions.SET_LOADING, payload: false });
    }
  };

  const resetPassword = async (payload) => {
    dispatch({ type: AuthActions.SET_LOADING, payload: true });
    dispatch({ type: AuthActions.SET_ERROR, payload: null });
    try {
      const res = await fetch(API_URLS.ResetPassword, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      return data;
    } catch (e) {
      dispatch({ type: AuthActions.SET_ERROR, payload: e.message });
      throw e;
    } finally {
      dispatch({ type: AuthActions.SET_LOADING, payload: false });
    }
  };

  const getMe = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(API_URLS.Me, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
      const userData = {
        ...data?.data?.user,
        userProfile: data?.data?.userProfile,
        shopProfile: data?.data?.shopProfile,
      };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      dispatch({ type: AuthActions.SET_USER, payload: userData });
      return data;
    } catch (e) {
      dispatch({ type: AuthActions.SET_ERROR, payload: e.message });
      throw e;
    }
  };

  const registerServiceProvider = async (formData) => {
    dispatch({ type: AuthActions.SET_LOADING, payload: true });
    dispatch({ type: AuthActions.SET_ERROR, payload: null });
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const headers = token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : { Accept: 'application/json' };
      const res = await fetch(API_URLS.RegisterServiceProvider, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      const userData = {
        ...data?.data?.user,
        userProfile: data?.data?.userProfile,
        shopProfile: data?.data?.shopProfile,
      };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      dispatch({ type: AuthActions.SET_USER, payload: userData });
      return data;
    } catch (e) {
      dispatch({ type: AuthActions.SET_ERROR, payload: e.message });
      throw e;
    } finally {
      dispatch({ type: AuthActions.SET_LOADING, payload: false });
    }
  };

  const updateServiceProvider = async (formData) => {
    dispatch({ type: AuthActions.SET_LOADING, payload: true });
    dispatch({ type: AuthActions.SET_ERROR, payload: null });
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const headers = token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : { Accept: 'application/json' };
      const res = await fetch(API_URLS.UpdateServiceProvider, {
        method: 'PATCH',
        headers,
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      const userData = {
        ...data?.data?.user,
        userProfile: data?.data?.userProfile,
        shopProfile: data?.data?.shopProfile,
      };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      dispatch({ type: AuthActions.SET_USER, payload: userData });
      return data;
    } catch (e) {
      dispatch({ type: AuthActions.SET_ERROR, payload: e.message });
      throw e;
    } finally {
      dispatch({ type: AuthActions.SET_LOADING, payload: false });
    }
  };

  const updateShop = async (formData) => {
    dispatch({ type: AuthActions.SET_LOADING, payload: true });
    dispatch({ type: AuthActions.SET_ERROR, payload: null });
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const headers = token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : { Accept: 'application/json' };
      const res = await fetch(API_URLS.UpdateShop, {
        method: 'PATCH',
        headers,
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      const userData = {
        ...data?.data?.user,
        userProfile: data?.data?.userProfile,
        shopProfile: data?.data?.shopProfile,
      };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      dispatch({ type: AuthActions.SET_USER, payload: userData });
      return data;
    } catch (e) {
      dispatch({ type: AuthActions.SET_ERROR, payload: e.message });
      throw e;
    } finally {
      dispatch({ type: AuthActions.SET_LOADING, payload: false });
    }
  };

  const registerShop = async (formData) => {
    dispatch({ type: AuthActions.SET_LOADING, payload: true });
    dispatch({ type: AuthActions.SET_ERROR, payload: null });
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const headers = token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : { Accept: 'application/json' };
      const res = await fetch(API_URLS.RegisterShop, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      const userData = {
        ...data?.data?.user,
        userProfile: data?.data?.userProfile,
        shopProfile: data?.data?.shopProfile,
      };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      dispatch({ type: AuthActions.SET_USER, payload: userData });
      return data;
    } catch (e) {
      dispatch({ type: AuthActions.SET_ERROR, payload: e.message });
      throw e;
    } finally {
      dispatch({ type: AuthActions.SET_LOADING, payload: false });
    }
  };

  const changePassword = async (payload) => {
    dispatch({ type: AuthActions.SET_LOADING, payload: true });
    dispatch({ type: AuthActions.SET_ERROR, payload: null });
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(API_URLS.ChangePassword, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Change password failed');
      return data;
    } catch (e) {
      dispatch({ type: AuthActions.SET_ERROR, payload: e.message });
      throw e;
    } finally {
      dispatch({ type: AuthActions.SET_LOADING, payload: false });
    }
  };

  return {
    ...state,
    register,
    registerServiceProvider,
    updateServiceProvider,
    registerShop,
    updateShop,
    getMe,
    login,
    logout,
    restoreSession,
    forgotPassword,
    resetPassword,
    changePassword,
  };
};
