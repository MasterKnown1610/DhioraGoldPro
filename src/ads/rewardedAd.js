/**
 * Rewarded Interstitial Ad service using react-native-google-mobile-ads.
 * Uses test ID in development and production ad unit ID in release.
 * Gold is only granted by backend via AdMob SSV; this module only loads/shows and logs reward.
 */

import {
  RewardedInterstitialAd,
  TestIds,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

// Production Rewarded Ad Unit ID; TestIds.REWARDED_INTERSTITIAL used in __DEV__
const PRODUCTION_REWARDED_AD_UNIT_ID = 'ca-app-pub-4292460929510961/5576724603';

const adUnitId = __DEV__ ? TestIds.REWARDED_INTERSTITIAL : PRODUCTION_REWARDED_AD_UNIT_ID;

// Single ad instance for current load; recreated per load so SSV options use correct userId
let currentAd = null;
let unsubscribes = [];

/**
 * Unsubscribe from all listeners and clear current ad reference.
 */
function cleanup() {
  unsubscribes.forEach((fn) => { if (typeof fn === 'function') fn(); });
  unsubscribes = [];
  currentAd = null;
}

/**
 * Load a rewarded interstitial ad. Pass userId so AdMob SSV callback can credit the correct user.
 * Call showRewardedAd() only after this resolves or onLoaded is called.
 *
 * @param {string} [userId] - Optional GlobalUser _id for server-side verification (SSV). Google sends this to your backend.
 * @returns {Promise<boolean>} - Resolves with true when loaded, false on error or if already loading.
 */
export function loadRewardedAd(userId = '') {
  return new Promise((resolve) => {
    cleanup();

    const requestOptions = {};
    if (userId) {
      requestOptions.serverSideVerificationOptions = { userId: String(userId) };
    }

    currentAd = RewardedInterstitialAd.createForAdRequest(adUnitId, requestOptions);

    // RewardedInterstitialAd requires RewardedAdEventType for LOADED/EARNED_REWARD, not AdEventType
    const unsubLoaded = currentAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      resolve(true);
    });

    const unsubError = currentAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.warn('[RewardedAd] Load error:', error?.message ?? error);
      cleanup();
      resolve(false);
    });

    unsubscribes.push(unsubLoaded, unsubError);
    currentAd.load();
  });
}

/**
 * Show the rewarded interstitial. Only call when ad has been loaded (e.g. after loadRewardedAd resolves with true).
 *
 * @param {Object} callbacks
 * @param {(reward: { amount: number, type: string }) => void} [callbacks.onEarnedReward] - Called when user earns reward. Do NOT grant gold here; backend SSV grants it.
 * @param {() => void} [callbacks.onClosed] - Called when ad is dismissed; use to reload next ad.
 */
export function showRewardedAd(callbacks = {}) {
  const { onEarnedReward, onClosed } = callbacks;

  if (!currentAd) {
    console.warn('[RewardedAd] Cannot show: ad not loaded. Call loadRewardedAd first.');
    return;
  }

  const unsubEarned = currentAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
    // Log only; actual gold is granted by backend via AdMob SSV callback.
    if (__DEV__) {
      console.log('[RewardedAd] User earned reward:', reward?.amount, reward?.type);
    }
    onEarnedReward?.(reward);
  });

  const unsubClosed = currentAd.addAdEventListener(AdEventType.CLOSED, () => {
    unsubEarned();
    unsubClosed();
    cleanup();
    onClosed?.();
  });

  currentAd.show();
}

/**
 * Whether an ad is currently loaded and safe to show.
 * @returns {boolean}
 */
export function isRewardedAdLoaded() {
  return currentAd != null;
}

export { adUnitId, TestIds };
