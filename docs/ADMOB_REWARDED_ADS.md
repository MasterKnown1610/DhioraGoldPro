# AdMob Rewarded Interstitial Ads

This app uses **react-native-google-mobile-ads** for rewarded interstitial ads. Gold is granted **only by the backend** via AdMob Server-Side Verification (SSV); the app never credits gold on its own.

## Configuration

- **App ID:** `ca-app-pub-4292460929510961~7144849340` (in `AndroidManifest.xml` and iOS `Info.plist` as `GADApplicationIdentifier`)
- **Rewarded Ad Unit ID:** `ca-app-pub-4292460929510961/5576724603` (used in `src/ads/rewardedAd.js` in production)

## Switching from test to production

1. **Ad unit ID**  
   - In **development** (`__DEV__ === true`), the code uses `TestIds.REWARDED_INTERSTITIAL` so test ads are shown.  
   - In **production** (release build), it uses the real Rewarded Ad Unit ID above. No code change needed; the switch is automatic.

2. **Test device IDs**  
   - In `App.jsx`, `initMobileAds()` sets `testDeviceIdentifiers` only in `__DEV__`.  
   - When you run the app and request an ad, the first request logs your device ID (e.g. in Android logcat). Add that ID to the `testDeviceIdentifiers` array so that device always gets test ads and you avoid policy issues.  
   - For production builds, do **not** add real user device IDs; leave test IDs only for dev builds or remove the array in release.

3. **Backend SSV**  
   - Configure your AdMob app with the **SSV callback URL** (e.g. `https://your-api.com/api/admob/reward`).  
   - Google will call that URL with `user_id`, `reward_amount`, `signature`, `key_id`. The backend must validate and credit gold; the app only loads/shows the ad and passes `userId` via `serverSideVerificationOptions` when loading.

## Play Store requirement

- In **Google Play Console**, for the app that shows ads, you must declare that the app **contains ads**.  
- In the app’s **Store settings** (or **Policy** section), enable “Contains ads” / “Ad-supported.”  
- Failing to declare ads can lead to policy violations or rejection.

## Files

| File | Purpose |
|------|--------|
| `android/app/src/main/AndroidManifest.xml` | AdMob Application ID `<meta-data>` |
| `App.jsx` | `mobileAds().setRequestConfiguration()` and `mobileAds().initialize()` |
| `src/ads/rewardedAd.js` | Load/show rewarded interstitial; test vs prod ad unit; SSV `userId` |
| `src/screens/RewardScreen.js` | Example “Watch Ad to Earn Gold” screen and navigation usage |

## Example usage in navigation

The “Earn Gold” screen is registered in the Profile stack:

```js
// In AppNavigator.js (ProfileStack)
<Stack.Screen
  name="Earn Gold"
  component={RewardScreen}
  options={{ headerTitle: 'Earn Gold', ... }}
/>
```

Navigate from Profile:

```js
navigation.navigate('Earn Gold');
```

From any screen that has auth context, you can also use the ad service directly:

```js
import { loadRewardedAd, showRewardedAd, isRewardedAdLoaded } from '../src/ads/rewardedAd';

// Load with current user id for SSV
await loadRewardedAd(auth.user?._id);
if (isRewardedAdLoaded()) {
  showRewardedAd({
    onEarnedReward: (reward) => console.log('Earned', reward),
    onClosed: () => loadRewardedAd(auth.user?._id), // reload for next time
  });
}
```
