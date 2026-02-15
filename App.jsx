import React, { useEffect } from 'react';
import { MobileAds } from 'react-native-google-mobile-ads';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ContextState from './context/ContextState';
import AppNavigator from './components/AppNavigator';

/**
 * Initialize Google Mobile Ads SDK on app start.
 * Package exports MobileAds (capital M) as named export; default also works.
 */
function initMobileAds() {
  // In __DEV__, add your device ID from logcat (Android) or Xcode (iOS) when you see it on first ad request
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
  useEffect(() => {
    initMobileAds();
  }, []);

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
