/**
 * Earn Gold screen: watch rewarded ad (SSV grants gold on backend), view wallet from API.
 */

import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Context from '../../context/Context';
import CustomButton from '../../components/CustomButton';
import { getWallet, creditAdWatched } from '../../service/goldApi';
import {
  loadRewardedAd,
  showRewardedAd,
  isRewardedAdLoaded,
} from '../ads/rewardedAd';

export default function RewardScreen({ navigation }) {
  const { auth, theme } = useContext(Context);
  const c = theme.colors;

  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);

  const userId = auth.user?._id ?? auth.user?.id ?? '';
  const token = auth.token;

  const loadWallet = useCallback(async () => {
    if (!token) {
      setWallet(null);
      setWalletLoading(false);
      return;
    }
    setWalletLoading(true);
    try {
      const json = await getWallet(token);
      setWallet(json.data ?? null);
    } catch (e) {
      console.warn('[RewardScreen] Wallet fetch failed:', e?.message);
      setWallet(null);
    } finally {
      setWalletLoading(false);
    }
  }, [token]);

  const loadAd = useCallback(() => {
    if (loading) return;
    setError(null);
    setLoaded(false);
    setLoading(true);
    loadRewardedAd(userId)
      .then((ok) => {
        setLoaded(ok);
        if (!ok) setError('Ad failed to load. Try again.');
      })
      .finally(() => setLoading(false));
  }, [userId, loading]);

  // Delay first ad load slightly so AdMob SDK has time to initialize
  useEffect(() => {
    const t = setTimeout(() => loadAd(), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const handleWatchAd = useCallback(() => {
    if (!isRewardedAdLoaded()) {
      Alert.alert('Not ready', 'Ad is still loading. Please wait.');
      return;
    }
    showRewardedAd({
      onEarnedReward: async (reward) => {
        console.log('[RewardScreen] Earned reward:', reward?.amount, reward?.type);
        try {
          const json = await creditAdWatched(token);
          if (json?.data) setWallet(json.data); // Update UI immediately with new balance
        } catch (e) {
          console.warn('[RewardScreen] Ad credit failed:', e?.message);
        }
      },
      onClosed: () => {
        setLoaded(false);
        loadAd();
        loadWallet(); // Refresh balance (in case credit was only in onEarnedReward or SSV)
      },
    });
  }, [token, loadAd, loadWallet]);

  return (
    
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Text style={[styles.title, { color: c.text }]}>Earn Gold</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Watch a short ad. Gold is credited by our server after verification (SSV).
        </Text>

        {/* Wallet from API */}
        {!token ? (
          <Text style={[styles.walletLabel, { color: c.textSecondary }]}>Log in to see your gold balance.</Text>
        ) : walletLoading ? (
          <ActivityIndicator size="small" color={c.accent} style={styles.walletLoader} />
        ) : wallet ? (
          <View style={[styles.walletCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={[styles.walletValue, { color: c.text }]}>{wallet.goldPoints ?? 0} gold</Text>
            <Text style={[styles.walletDetail, { color: c.textSecondary }]}>
              {wallet.remainingAdsToday ?? 0} ads left today (max 20)
            </Text>
          </View>
        ) : null}

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={c.accent} />
            <Text style={[styles.loadingText, { color: c.textSecondary }]}>Loading ad…</Text>
          </View>
        )}

        {error ? (
          <>
            <Text style={[styles.errorText, { color: (c.error != null ? c.error : '#c00') }]}>{error}</Text>
            <View style={styles.retryRow}>
              <CustomButton title="Retry loading ad" onPress={() => loadAd()} />
            </View>
          </>
        ) : null}

        <View style={[(!loaded || loading) && styles.buttonDisabled]}>
          <CustomButton title="Watch Ad to Earn Gold" onPress={handleWatchAd} />
        </View>

        {!loaded && !loading && !error && (
          <Text style={[styles.hint, { color: c.textSecondary }]}>
            Tap reload or wait a moment for the ad to load.
          </Text>
        )}
      </View>
    
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 16, textAlign: 'center' },
  walletLabel: { fontSize: 14, marginBottom: 16, textAlign: 'center' },
  walletLoader: { marginBottom: 16 },
  walletCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  walletValue: { fontSize: 20, fontWeight: 'bold' },
  walletDetail: { fontSize: 13, marginTop: 4 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  loadingText: { marginLeft: 8, fontSize: 14 },
  errorText: { fontSize: 14, marginBottom: 8, textAlign: 'center' },
  retryRow: { marginBottom: 16 },
  hint: { fontSize: 12, marginTop: 16, textAlign: 'center' },
  buttonDisabled: { opacity: 0.6 },
});
