import React, { useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../CustomButton';
import Context from '../../context/Context';
import i18n, { setStoredLanguage } from '../../i18n';

const MENU_ITEMS = [
  { id: 'referral', labelKey: 'profile.referral', icon: 'card-giftcard', route: 'My Referral' },
  { id: 'manage', labelKey: 'profile.manageProfile', icon: 'person', route: 'ManageProfile' },
  { id: 'manageShop', labelKey: 'profile.manageShop', icon: 'storefront', route: 'ManageShop' },
  { id: 'password', labelKey: 'profile.passwordSecurity', icon: 'lock', route: 'PasswordSecurity' },
  { id: 'language', labelKey: 'profile.language', icon: 'language', route: null },
  { id: 'theme', labelKey: 'profile.theme', icon: 'palette', route: null },
  { id: 'help', labelKey: 'profile.helpCenter', icon: 'help-outline', route: 'HelpCenter' },
];

const LANGUAGES = [
  { code: 'en', labelKey: 'language.english' },
  { code: 'hi', labelKey: 'language.hindi' },
  { code: 'te', labelKey: 'language.telugu' },
];

const ProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { auth, theme } = useContext(Context);
  const c = theme.colors;
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user details when Profile screen is focused (same data as login)
  const fetchUserDetails = useCallback(async () => {
    if (!auth.token) return;
    try {
      await auth.getMe();
    } catch (e) {
      // Optionally show error; avoid blocking UI
    } finally {
      setRefreshing(false);
    }
  }, [auth.token, auth.getMe]);

  useFocusEffect(
    useCallback(() => {
      fetchUserDetails();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserDetails();
  }, []);

  const displayName =
    auth.user?.userProfile?.userName || auth.user?.name || auth.user?.email || auth.user?.phoneNumber || 'Guest';
  const displayEmail = auth.user?.email || auth.user?.phoneNumber || '—';
  const profileImageUri = auth.user?.userProfile?.profileImage || null;
  const hasUserProfile = !!auth.user?.userProfile;
  const hasShopProfile = !!auth.user?.shopProfile;

  const handleLogout = () => {
    Alert.alert(t('common.logout'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.logout'), style: 'destructive', onPress: auth.logout },
    ]);
  };

  const handleMenuPress = (item) => {
    if (item.id === 'referral') {
      if (!auth.token) {
        navigation.navigate('Login');
        return;
      }
      navigation.navigate('My Referral');
      return;
    }
    if (item.id === 'theme') {
      theme.toggleTheme();
      return;
    }
    if (item.id === 'manage') {
      if (hasUserProfile) navigation.navigate('Edit Service Provider');
      else navigation.navigate('Register Service Provider');
      return;
    }
    if (item.id === 'manageShop') {
      if (hasShopProfile) navigation.navigate('Edit Shop');
      else navigation.navigate('Register Shop');
      return;
    }
    if (item.id === 'password') {
      if (!auth.token) {
        navigation.navigate('Login');
        return;
      }
      navigation.navigate('Change Password');
      return;
    }
    if (item.id === 'help') {
      navigation.getParent()?.navigate('Help');
      return;
    }
    if (item.id === 'language') {
      setLanguageModalVisible(true);
      return;
    }
  };

  const handleLanguageSelect = async (code) => {
    await i18n.changeLanguage(code);
    await setStoredLanguage(code);
    setLanguageModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          auth.token ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[c.accent]} tintColor={c.accent} />
          ) : undefined
        }
      >
        {/* Profile header: avatar + name + email */}
        <View style={[styles.header, { backgroundColor: c.background }]}>
          <View style={[styles.avatarWrap, { borderColor: c.border }]}>
            {profileImageUri ? (
              <Image source={{ uri: profileImageUri }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: c.surface }]}>
                <Icon name="person" size={40} color={c.textSecondary} />
              </View>
            )}
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.displayName, { color: c.text }]} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={[styles.displayEmail, { color: c.textSecondary }]} numberOfLines={1}>
              {displayEmail}
            </Text>
          </View>
        </View>

        {/* Menu list */}
        <View style={[styles.menuCard, { backgroundColor: c.surface, borderColor: c.border }]}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuRow,
                { borderBottomColor: c.border },
                index === MENU_ITEMS.length - 1 && styles.menuRowLast,
              ]}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <Icon name={item.icon} size={22} color={c.text} style={styles.menuIcon} />
              <Text style={[styles.menuLabel, { color: c.text }]}>{t(item.labelKey)}</Text>
              <Icon name="chevron-right" size={22} color={c.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Earn Gold – bottom (logged in) */}
        {auth.token && (
          <TouchableOpacity
            style={[styles.extraRow, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => navigation.navigate('Earn Gold')}
          >
            <Icon name="monetization-on" size={22} color={c.accent} style={styles.menuIcon} />
            <Text style={[styles.menuLabel, { color: c.text }]}>{t('profile.earnGold')}</Text>
            <Icon name="chevron-right" size={22} color={c.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Login / Register or Logout – last */}
        <View style={styles.actions}>
          {auth.token ? (
            <CustomButton title={t('common.logout')} onPress={handleLogout} />
          ) : (
            <>
              <CustomButton title={t('common.login')} onPress={() => navigation.navigate('Login')} />
              <View style={styles.buttonSpacer} />
              <CustomButton title={t('common.register')} onPress={() => navigation.navigate('Register')} />
              <TouchableOpacity style={styles.forgotPasswordWrap} onPress={() => navigation.navigate('Forgot Password')}>
                <Text style={[styles.forgotPasswordLink, { color: c.accent }]}>{t('login.forgotPassword')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Language selection modal */}
        <Modal
          visible={languageModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setLanguageModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setLanguageModalVisible(false)}
          >
            <View style={[styles.withdrawModalCard, { backgroundColor: c.surface, borderColor: c.border, marginHorizontal: 24 }]} onStartShouldSetResponder={() => true}>
              <Text style={[styles.withdrawModalTitle, { color: c.text }]}>{t('language.selectLanguage')}</Text>
              <Text style={[styles.withdrawModalHint, { color: c.textSecondary, marginBottom: 16 }]}>{t('profile.languageOption')}</Text>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.languageOption, { borderColor: c.border }]}
                  onPress={() => handleLanguageSelect(lang.code)}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: c.text, fontSize: 16 }}>{t(lang.labelKey)}</Text>
                  {i18n.language === lang.code && <Icon name="check" size={22} color={c.accent} />}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.withdrawModalBtnCancel, { backgroundColor: c.border, marginTop: 16 }]}
                onPress={() => setLanguageModalVisible(false)}
              >
                <Text style={[styles.withdrawModalBtnText, { color: c.text }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 32 },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: { flex: 1, marginLeft: 16, justifyContent: 'center', minWidth: 0 },
  displayName: { fontSize: 18, fontWeight: '700' },
  displayEmail: { fontSize: 14, marginTop: 4 },
  menuCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuRowLast: { borderBottomWidth: 0 },
  menuIcon: { marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  extraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actions: { marginTop: 24 },
  buttonSpacer: { height: 12 },
  forgotPasswordWrap: { marginTop: 12, alignSelf: 'center' },
  forgotPasswordLink: { fontSize: 14, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContentWrap: {
    width: '100%',
  },
  withdrawModalCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  withdrawModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  withdrawModalBalance: {
    fontSize: 14,
    marginBottom: 16,
  },
  withdrawModalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  withdrawModalInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  withdrawModalHint: {
    fontSize: 12,
    marginTop: 6,
    marginBottom: 4,
  },
  withdrawModalDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  withdrawModalDropdownText: {
    fontSize: 16,
  },
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
  withdrawModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
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
  withdrawModalBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
});

export default ProfileScreen;
