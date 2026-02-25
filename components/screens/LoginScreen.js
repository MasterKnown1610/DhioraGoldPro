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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Context from '../../context/Context';
import CustomButton from '../CustomButton';

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { auth, theme } = useContext(Context);
  const c = theme.colors;
  const [loginWithEmail, setLoginWithEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const payload = loginWithEmail
      ? { email: email.trim(), password }
      : { phoneNumber: phoneNumber.trim(), password };

    if (loginWithEmail && !email.trim()) {
      Alert.alert(t('common.error'), t('login.enterEmailError'));
      return;
    }
    if (!loginWithEmail && !phoneNumber.trim()) {
      Alert.alert(t('common.error'), t('login.enterPhoneError'));
      return;
    }
    if (!password) {
      Alert.alert(t('common.error'), t('login.enterPasswordError'));
      return;
    }

    try {
      await auth.login(payload);
      navigation.goBack();
    } catch (e) {
      Alert.alert(t('login.loginFailed'), e.message || t('login.invalidCredentials'));
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={[styles.title, { color: c.text }]}>{t('login.title')}</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>{t('login.subtitle')}</Text>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, !loginWithEmail && { backgroundColor: c.accent }]}
            onPress={() => setLoginWithEmail(false)}
          >
            <Text style={[styles.toggleText, { color: !loginWithEmail ? '#000' : c.textSecondary }]}>{t('common.phone')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, loginWithEmail && { backgroundColor: c.accent }]}
            onPress={() => setLoginWithEmail(true)}
          >
            <Text style={[styles.toggleText, { color: loginWithEmail ? '#000' : c.textSecondary }]}>{t('common.email')}</Text>
          </TouchableOpacity>
        </View>

        {loginWithEmail ? (
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

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: c.text }]}>{t('common.password')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
            placeholder={t('common.enterPassword')}
            placeholderTextColor={c.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {auth.loading ? (
          <ActivityIndicator size="large" color={c.accent} style={styles.loader} />
        ) : (
          <CustomButton title={t('common.login')} onPress={handleLogin} />
        )}

        <TouchableOpacity style={styles.forgotLink} onPress={() => navigation.navigate('Forgot Password')}>
          <Text style={[styles.registerLink, { color: c.accent }]}>{t('login.forgotPassword')}</Text>
        </TouchableOpacity>

        <View style={styles.registerLinks}>
          <Text style={[styles.registerText, { color: c.textSecondary }]}>{t('login.noAccount')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.registerLink, { color: c.accent }]}>{t('common.register')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 24 },
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
  forgotLink: { marginTop: 12, alignSelf: 'flex-start' },
  registerLinks: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  registerText: { fontSize: 14 },
  registerLink: { fontSize: 14, fontWeight: '600' },
});

export default LoginScreen;
