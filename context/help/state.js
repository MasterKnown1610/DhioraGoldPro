import { useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URLS } from '../../service/config';
import Reducer from './reducer';
import { HelpActions } from './action';

const TOKEN_KEY = '@gold_token';

export const initialState = {
  complaints: [],
  pagination: null,
  loading: false,
  error: null,
};

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const HelpState = () => {
  const [state, dispatch] = useReducer(Reducer, initialState);

  const submitComplaint = async (payload) => {
    dispatch({ type: HelpActions.SET_LOADING, payload: true });
    dispatch({ type: HelpActions.SET_ERROR, payload: null });
    try {
      const headers = await getAuthHeader();
      const res = await fetch(API_URLS.Help, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit complaint');
      return data;
    } catch (e) {
      dispatch({ type: HelpActions.SET_ERROR, payload: e.message });
      throw e;
    } finally {
      dispatch({ type: HelpActions.SET_LOADING, payload: false });
    }
  };

  const getMyComplaints = async (params = {}) => {
    dispatch({ type: HelpActions.SET_LOADING, payload: true });
    dispatch({ type: HelpActions.SET_ERROR, payload: null });
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error('Login required to view your complaints');
      const q = new URLSearchParams(params).toString();
      const url = `${API_URLS.Help}${q ? `?${q}` : ''}`;
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(url, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch complaints');
      dispatch({ type: HelpActions.SET_COMPLAINTS, payload: data?.data ?? [] });
      dispatch({ type: HelpActions.SET_PAGINATION, payload: data?.pagination ?? null });
      return data;
    } catch (e) {
      dispatch({ type: HelpActions.SET_ERROR, payload: e.message });
      throw e;
    } finally {
      dispatch({ type: HelpActions.SET_LOADING, payload: false });
    }
  };

  return {
    ...state,
    submitComplaint,
    getMyComplaints,
  };
};
