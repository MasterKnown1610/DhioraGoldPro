import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';

import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';

const LANGUAGE_KEY = '@app_language';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  te: { translation: te },
};

const getDeviceLocale = () => {
  try {
    if (typeof RNLocalize?.getLocales === 'function') {
      const locales = RNLocalize.getLocales();
      const tag = locales?.[0]?.languageTag || 'en';
      const lang = tag.split('-')[0];
      if (lang === 'hi' || lang === 'te' || lang === 'en') return lang;
    }
  } catch (e) {}
  return 'en';
};

export const getStoredLanguage = async () => {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored && resources[stored]) return stored;
  } catch (e) {}
  return null;
};

export const setStoredLanguage = async (lng) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lng);
  } catch (e) {}
};

export const initI18n = async () => {
  const stored = await getStoredLanguage();
  const lng = stored || getDeviceLocale();

  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
  });

  if (!stored) await setStoredLanguage(lng);
  return i18n;
};

export default i18n;
