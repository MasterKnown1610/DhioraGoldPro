import { useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URLS } from '../../service/config';
import Reducer from './reducer';
import { UsersActions } from './action';

const TOKEN_KEY = '@gold_token';

export const initialState = {
  users: [],
  singleUser: null,
  pagination: null,
  loading: false,
  error: null,
};

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const UsersState = () => {
  const [state, dispatch] = useReducer(Reducer, initialState);

  const getUsers = async (params = {}) => {
    dispatch({ type: UsersActions.SET_LOADING, payload: true });
    dispatch({ type: UsersActions.SET_ERROR, payload: null });
    try {
      const q = new URLSearchParams(params).toString();
      const url = `${API_URLS.Users}${q ? `?${q}` : ''}`;
      const headers = await getAuthHeader();
      const res = await fetch(url, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
      dispatch({ type: UsersActions.SET_USERS, payload: data?.data ?? [] });
      dispatch({ type: UsersActions.SET_PAGINATION, payload: data?.pagination ?? null });
      return data;
    } catch (e) {
      dispatch({ type: UsersActions.SET_ERROR, payload: e.message });
      throw e;
    } finally {
      dispatch({ type: UsersActions.SET_LOADING, payload: false });
    }
  };

  const getUserById = async (id) => {
    dispatch({ type: UsersActions.SET_LOADING, payload: true });
    dispatch({ type: UsersActions.SET_ERROR, payload: null });
    try {
      const headers = await getAuthHeader();
      const res = await fetch(API_URLS.UserById(id), { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'User not found');
      dispatch({ type: UsersActions.SET_SINGLE_USER, payload: data?.data ?? null });
      return data;
    } catch (e) {
      dispatch({ type: UsersActions.SET_ERROR, payload: e.message });
      throw e;
    } finally {
      dispatch({ type: UsersActions.SET_LOADING, payload: false });
    }
  };

  const registerUser = async (formData) => {
    dispatch({ type: UsersActions.SET_LOADING, payload: true });
    dispatch({ type: UsersActions.SET_ERROR, payload: null });
    try {
      const headers = await getAuthHeader();
      const res = await fetch(API_URLS.Users, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to register user');
      return data;
    } catch (e) {
      dispatch({ type: UsersActions.SET_ERROR, payload: e.message });
      throw e;
    } finally {
      dispatch({ type: UsersActions.SET_LOADING, payload: false });
    }
  };

  return {
    ...state,
    getUsers,
    getUserById,
    registerUser,
  };
};
