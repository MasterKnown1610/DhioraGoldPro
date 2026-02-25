import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { MobileAds } from 'react-native-google-mobile-ads';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ContextState from './context/ContextState';
import AppNavigator from './components/AppNavigator';
import { initI18n } from './i18n';

/**
 * Initialize Google Mobile Ads SDK on app start.
 */
function initMobileAds() {
  const config = __DEV__ ? { testDeviceIdentifiers: [] } : {};
  const mobileAds = MobileAds();
  mobileAds
    .setRequestConfiguration(config)
    .then(() => mobileAds.initialize())
    .then(() => {
      if (__DEV__) console.log('[AdMob] SDK initialized');
    })
    .catch((err) => {
      console.warn('[AdMob] Init failed:', err?.message ?? err);
    });
}

export default function App() {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n()
      .then(() => setI18nReady(true))
      .catch(() => setI18nReady(true));
  }, []);

  useEffect(() => {
    if (i18nReady) initMobileAds();
  }, [i18nReady]);

  if (!i18nReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <ActivityIndicator size="large" color="#F8C24D" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ContextState>
          <AppNavigator />
        </ContextState>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
