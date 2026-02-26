import React, { useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Share,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../CustomButton';
import Context from '../../context/Context';
import { API_URLS } from '../../service/config';
import { WITHDRAWAL_MESSAGES } from '../../constants/withdrawalMessages';

const TOKEN_KEY = '@gold_token';

const WITHDRAWAL_TYPE_OPTIONS = [
  { value: 'phonepe', label: 'PhonePe' },
  { value: 'gpay', label: 'GPay' },
];

const MyReferralScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { auth, theme } = useContext(Context);
  const c = theme.colors;
  const [refundLoading, setRefundLoading] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawType, setWithdrawType] = useState('phonepe');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawTypePickerVisible, setWithdrawTypePickerVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (auth.token) auth.getMe();
    }, [auth.token])
  );

  const referralCode = auth.user?.referralCode || null;
  const referralBalance = auth.user?.referralBalance ?? 0;
  const canRefund = referralBalance >= 10 && !auth.user?.referralRefundRequestedAt;

  const handleShare = useCallback(async () => {
    if (!referralCode) return;
    try {
      await Share.share({
        message: `Use my Dhiora Gold referral code: ${referralCode}. Join and earn with me!`,
        title: 'My Referral Code',
      });
    } catch (e) {
      if (e.message !== 'User did not share') {
        Alert.alert('Error', e.message || 'Could not share');
      }
    }
  }, [referralCode]);

  const openWithdrawModal = useCallback(() => {
    if (!canRefund || refundLoading) return;
    setWithdrawAmount('');
    setWithdrawType('phonepe');
    setWithdrawPhone('');
    setWithdrawModalVisible(true);
  }, [canRefund, refundLoading]);

  const closeWithdrawModal = useCallback(() => {
    setWithdrawModalVisible(false);
    setWithdrawAmount('');
    setWithdrawType('phonepe');
    setWithdrawPhone('');
    setWithdrawTypePickerVisible(false);
  }, []);

  const requestRefund = useCallback(async () => {
    const amountNum = Number(withdrawAmount?.trim().replace(/,/g, ''));
    if (!Number.isFinite(amountNum) || amountNum < 10) {
      Alert.alert('Invalid amount', WITHDRAWAL_MESSAGES.INVALID_AMOUNT);
      return;
    }
    if (amountNum > referralBalance) {
      Alert.alert('Invalid amount', WITHDRAWAL_MESSAGES.INVALID_AMOUNT);
      return;
    }
    const phoneDigits = (withdrawPhone || '').replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      Alert.alert('Invalid phone', WITHDRAWAL_MESSAGES.INVALID_MOBILE);
      return;
    }
    setRefundLoading(true);
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const res = await fetch(API_URLS.ReferralRequestRefund, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount: amountNum,
          withdrawalType: withdrawType,
          withdrawalPhone: phoneDigits,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      await auth.getMe();
      closeWithdrawModal();
      Alert.alert('Success', WITHDRAWAL_MESSAGES.REQUEST_RAISED);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not request refund');
    } finally {
      setRefundLoading(false);
    }
  }, [withdrawAmount, withdrawType, withdrawPhone, referralBalance, auth, closeWithdrawModal]);

  if (!auth.token) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.placeholderText, { color: c.textSecondary }]}>
            {t('profile.referral')} – {t('common.login')} to view your code.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Referral card – same as profile */}
        <View style={[styles.referralCard, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.referralTitle, { color: c.text }]}>{t('profile.referral')}</Text>
          <Text style={[styles.referralCodeLabel, { color: c.textSecondary }]}>{t('profile.shareCode')}</Text>
          <Text style={[styles.referralCodeBig, { color: c.accent }]} selectable>
            {referralCode || '—'}
          </Text>
          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: c.accent }]}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Icon name="share" size={20} color="#1A1A1A" />
            <Text style={styles.shareBtnText}>{t('profile.shareReferral')}</Text>
          </TouchableOpacity>
          <Text style={[styles.referralDetail, { color: c.textSecondary }]}>
            {t('profile.balance', { balance: referralBalance })}
          </Text>
          {referralBalance < 10 && !auth.user?.referralRefundRequestedAt && (
            <Text style={[styles.referralHint, { color: c.textSecondary }]}>
              {WITHDRAWAL_MESSAGES.MIN_BALANCE_REQUIRED}
            </Text>
          )}
          {canRefund && (
            <Text style={[styles.referralHint, { color: c.textSecondary }]}>
              Withdraw when balance ≥ ₹10. Processed within 2 business days.
            </Text>
          )}
          {auth.user?.referralRefundRequestedAt && (
            <Text style={[styles.referralHint, { color: c.textSecondary }]}>
              {WITHDRAWAL_MESSAGES.REQUEST_RAISED}
            </Text>
          )}
          {refundLoading ? (
            <ActivityIndicator size="small" color={c.accent} style={{ marginTop: 8 }} />
          ) : (
            <CustomButton
              title={t('profile.requestWithdrawal')}
              onPress={openWithdrawModal}
              disabled={!canRefund}
            />
          )}
        </View>
      </ScrollView>

      {/* Withdrawal modal */}
      <Modal
        visible={withdrawModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeWithdrawModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeWithdrawModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContentWrap}
          >
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={[styles.withdrawModalCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Text style={[styles.withdrawModalTitle, { color: c.text }]}>Withdraw</Text>
                <Text style={[styles.withdrawModalBalance, { color: c.textSecondary }]}>
                  Available balance: ₹{referralBalance}
                </Text>
                <Text style={[styles.withdrawModalLabel, { color: c.text }]}>Amount to withdraw (₹)</Text>
                <TextInput
                  style={[styles.withdrawModalInput, { backgroundColor: c.background, color: c.text, borderColor: c.border }]}
                  placeholder="Enter amount"
                  placeholderTextColor={c.textSecondary}
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                  keyboardType="numeric"
                />
                <Text style={[styles.withdrawModalHint, { color: c.textSecondary }]}>
                  Min ₹10, max ₹{referralBalance}
                </Text>
                <Text style={[styles.withdrawModalLabel, { color: c.text, marginTop: 12 }]}>Payment type</Text>
                <TouchableOpacity
                  style={[styles.withdrawModalDropdown, { backgroundColor: c.background, borderColor: c.border }]}
                  onPress={() => setWithdrawTypePickerVisible((v) => !v)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.withdrawModalDropdownText, { color: c.text }]}>
                    {WITHDRAWAL_TYPE_OPTIONS.find((o) => o.value === withdrawType)?.label ?? 'Select'}
                  </Text>
                  <Icon name={withdrawTypePickerVisible ? 'expand-less' : 'expand-more'} size={24} color={c.textSecondary} />
                </TouchableOpacity>
                {withdrawTypePickerVisible && (
                  <View style={[styles.withdrawModalDropdownList, { backgroundColor: c.background, borderColor: c.border }]}>
                    {WITHDRAWAL_TYPE_OPTIONS.map((opt, idx) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[
                          styles.withdrawModalDropdownOption,
                          { borderBottomColor: c.border },
                          idx === WITHDRAWAL_TYPE_OPTIONS.length - 1 && { borderBottomWidth: 0 },
                        ]}
                        onPress={() => {
                          setWithdrawType(opt.value);
                          setWithdrawTypePickerVisible(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={{ color: c.text, fontSize: 16 }}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                <Text style={[styles.withdrawModalLabel, { color: c.text, marginTop: 12 }]}>
                  Phone number (for {withdrawType === 'gpay' ? 'GPay' : 'PhonePe'})
                </Text>
                <TextInput
                  style={[styles.withdrawModalInput, { backgroundColor: c.background, color: c.text, borderColor: c.border }]}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={c.textSecondary}
                  value={withdrawPhone}
                  onChangeText={(val) => setWithdrawPhone(val.replace(/\D/g, '').slice(0, 10))}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                <Text style={[styles.withdrawModalHint, { color: c.textSecondary, marginBottom: 16 }]}>
                  10-digit number linked to your UPI
                </Text>
                <View style={styles.withdrawModalActions}>
                  <TouchableOpacity
                    style={[styles.withdrawModalBtnCancel, { backgroundColor: c.border }]}
                    onPress={closeWithdrawModal}
                  >
                    <Text style={[styles.withdrawModalBtnText, { color: c.text }]}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.withdrawModalBtnSubmit, { backgroundColor: c.accent }]}
                    onPress={requestRefund}
                    disabled={refundLoading}
                  >
                    {refundLoading ? (
                      <ActivityIndicator size="small" color={c.accentText || '#1A1A1A'} />
                    ) : (
                      <Text style={[styles.withdrawModalBtnText, { color: c.accentText || '#1A1A1A' }]}>
                        {t('profile.requestWithdrawal')}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  placeholderText: { fontSize: 16 },
  referralCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  referralTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  referralCodeLabel: { fontSize: 14, marginBottom: 8 },
  referralCodeBig: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  referralDetail: { fontSize: 14, marginTop: 4, flex: 1 },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    gap: 8,
    marginBottom: 16,
  },
  shareBtnText: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  referralHint: { fontSize: 12, marginTop: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContentWrap: { width: '100%' },
  withdrawModalCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  withdrawModalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  withdrawModalBalance: { fontSize: 14, marginBottom: 16 },
  withdrawModalLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  withdrawModalInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  withdrawModalHint: { fontSize: 12, marginTop: 6, marginBottom: 4 },
  withdrawModalDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  withdrawModalDropdownText: { fontSize: 16 },
  withdrawModalDropdownList: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  withdrawModalDropdownOption: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  withdrawModalActions: { flexDirection: 'row', gap: 12 },
  withdrawModalBtnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  withdrawModalBtnSubmit: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  withdrawModalBtnText: { fontSize: 16, fontWeight: '600' },
});

export default MyReferralScreen;
