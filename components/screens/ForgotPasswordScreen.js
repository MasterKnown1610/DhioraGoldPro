import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Context from '../../context/Context';
import CustomButton from '../CustomButton';

const ForgotPasswordScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { auth, theme } = useContext(Context);
  const c = theme.colors;
  const [useEmail, setUseEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState(1);
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRequestReset = async () => {
    const payload = useEmail ? { email: email.trim().toLowerCase() } : { phoneNumber: phoneNumber.trim() };
    if (useEmail && !email.trim()) {
      Alert.alert(t('common.error'), t('login.enterEmailError'));
      return;
    }
    if (!useEmail && !phoneNumber.trim()) {
      Alert.alert(t('common.error'), t('login.enterPhoneError'));
      return;
    }
    try {
      const data = await auth.forgotPassword(payload);
      const token = data?.data?.resetToken;
      if (token) {
        setResetToken(token);
        setStep(2);
      } else {
        Alert.alert(t('common.error'), 'Could not get reset token. Try again.');
      }
    } catch (e) {
      Alert.alert(t('common.error'), e.message || t('forgotPassword.noAccountFound'));
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken) {
      Alert.alert(t('common.error'), t('forgotPassword.sessionExpired'));
      setStep(1);
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert(t('common.error'), t('register.passwordMin'));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('forgotPassword.passwordsDontMatch'));
      return;
    }
    try {
      await auth.resetPassword({ resetToken, newPassword });
      Alert.alert(t('common.success'), t('forgotPassword.resetSuccess'), [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e) {
      Alert.alert(t('common.error'), e.message || 'Could not reset password. Token may have expired.');
    }
  };

  const handleBack = () => {
    setStep(1);
    setResetToken(null);
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: c.text }]}>{t('forgotPassword.title')}</Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            {step === 1 ? t('forgotPassword.subtitleStep1') : t('forgotPassword.subtitleStep2')}
          </Text>

          {step === 1 ? (
            <>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, !useEmail && { backgroundColor: c.accent }]}
                  onPress={() => setUseEmail(false)}
                >
                  <Text style={[styles.toggleText, { color: !useEmail ? '#000' : c.textSecondary }]}>{t('common.phone')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, useEmail && { backgroundColor: c.accent }]}
                  onPress={() => setUseEmail(true)}
                >
                  <Text style={[styles.toggleText, { color: useEmail ? '#000' : c.textSecondary }]}>{t('common.email')}</Text>
                </TouchableOpacity>
              </View>

              {useEmail ? (
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: c.text }]}>{t('common.email')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                    placeholder={t('common.enterEmail')}
                    placeholderTextColor={c.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              ) : (
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: c.text }]}>{t('common.phoneNumber')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                    placeholder={t('common.enterPhone')}
                    placeholderTextColor={c.textSecondary}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>
              )}

              {auth.loading ? (
                <ActivityIndicator size="large" color={c.accent} style={styles.loader} />
              ) : (
                <CustomButton title={t('forgotPassword.continue')} onPress={handleRequestReset} />
              )}
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: c.text }]}>{t('forgotPassword.newPassword')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                  placeholder={t('forgotPassword.enterNewPassword')}
                  placeholderTextColor={c.textSecondary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: c.text }]}>{t('forgotPassword.confirmPassword')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                  placeholder={t('forgotPassword.confirmNewPassword')}
                  placeholderTextColor={c.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              {auth.loading ? (
                <ActivityIndicator size="large" color={c.accent} style={styles.loader} />
              ) : (
                <>
                  <CustomButton title={t('forgotPassword.resetPassword')} onPress={handleResetPassword} />
                  <TouchableOpacity style={styles.backLink} onPress={handleBack}>
                    <Text style={[styles.backLinkText, { color: c.textSecondary }]}>{t('forgotPassword.useDifferent')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          <View style={styles.registerLinks}>
            <Text style={[styles.registerText, { color: c.textSecondary }]}>{t('forgotPassword.rememberPassword')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.registerLink, { color: c.accent }]}>{t('common.login')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  toggleRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#333',
  },
  toggleText: { fontSize: 16, fontWeight: '600' },
  inputContainer: { marginBottom: 16 },
  label: { fontWeight: '600', marginBottom: 8, fontSize: 14 },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  loader: { marginVertical: 24 },
  backLink: { marginTop: 16, alignItems: 'center' },
  backLinkText: { fontSize: 14 },
  registerLinks: { flexDirection: 'row', alignItems: 'center', marginTop: 24 },
  registerText: { fontSize: 14 },
  registerLink: { fontSize: 14, fontWeight: '600' },
});

export default ForgotPasswordScreen;
