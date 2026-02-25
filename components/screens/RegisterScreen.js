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

const RegisterScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { auth, theme } = useContext(Context);
  const c = theme.colors;
  const [registerWithEmail, setRegisterWithEmail] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    referralCode: '',
  });

  const handleRegister = async () => {
    const payload = registerWithEmail
      ? { name: form.name.trim(), email: form.email.trim(), password: form.password }
      : { name: form.name.trim(), phoneNumber: form.phoneNumber.trim(), password: form.password };
    if (form.referralCode?.trim()) payload.referralCode = form.referralCode.trim().toUpperCase();

    if (!form.name.trim()) {
      Alert.alert(t('common.error'), t('register.nameRequired'));
      return;
    }
    if (registerWithEmail && !form.email.trim()) {
      Alert.alert(t('common.error'), t('register.emailRequired'));
      return;
    }
    if (!registerWithEmail && !form.phoneNumber.trim()) {
      Alert.alert(t('common.error'), t('register.phoneRequired'));
      return;
    }
    if (form.password.length < 6) {
      Alert.alert(t('common.error'), t('register.passwordMin'));
      return;
    }

    try {
      await auth.register(payload);
      Alert.alert(t('common.success'), t('register.registerSuccess'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert(t('register.registerFailed'), e.message || 'Could not create account');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={[styles.title, { color: c.text }]}>{t('register.title')}</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>{t('register.subtitle')}</Text>
        <Text style={[styles.hint, { color: c.textSecondary }]}>{t('common.formHint')}</Text>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, !registerWithEmail && { backgroundColor: c.accent }]}
            onPress={() => setRegisterWithEmail(false)}
          >
            <Text style={[styles.toggleText, { color: !registerWithEmail ? '#000' : c.textSecondary }]}>{t('common.phone')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, registerWithEmail && { backgroundColor: c.accent }]}
            onPress={() => setRegisterWithEmail(true)}
          >
            <Text style={[styles.toggleText, { color: registerWithEmail ? '#000' : c.textSecondary }]}>{t('common.email')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: c.text }]}>{t('common.name')} *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
            placeholder={t('common.enterName')}
            placeholderTextColor={c.textSecondary}
            value={form.name}
            onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
          />
        </View>

        {registerWithEmail ? (
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: c.text }]}>{t('common.email')} *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
              placeholder="your@email.com"
              placeholderTextColor={c.textSecondary}
              value={form.email}
              onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: c.text }]}>{t('common.phoneNumber')} *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
              placeholder={t('common.enterPhone')}
              placeholderTextColor={c.textSecondary}
              value={form.phoneNumber}
              onChangeText={(v) => setForm((p) => ({ ...p, phoneNumber: v }))}
              keyboardType="phone-pad"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: c.text }]}>{t('common.minPassword')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
            placeholder={t('common.enterPassword')}
            placeholderTextColor={c.textSecondary}
            value={form.password}
            onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: c.textSecondary }]}>{t('register.referralLabel')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
            placeholder={t('register.referralPlaceholder')}
            placeholderTextColor={c.textSecondary}
            value={form.referralCode}
            onChangeText={(v) => setForm((p) => ({ ...p, referralCode: v }))}
            autoCapitalize="characters"
          />
        </View>

        {auth.loading ? (
          <ActivityIndicator size="large" color={c.accent} style={styles.loader} />
        ) : (
          <CustomButton title={t('common.register')} onPress={handleRegister} />
        )}

        <TouchableOpacity style={styles.forgotLink} onPress={() => navigation.navigate('Forgot Password')}>
          <Text style={[styles.registerLink, { color: c.accent }]}>{t('login.forgotPassword')}</Text>
        </TouchableOpacity>

        <View style={styles.registerLinks}>
          <Text style={[styles.registerText, { color: c.textSecondary }]}>{t('register.hasAccount')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.registerLink, { color: c.accent }]}>{t('common.login')}</Text>
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
  subtitle: { fontSize: 14, marginBottom: 8 },
  hint: { fontSize: 12, marginBottom: 16, fontStyle: 'italic' },
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

export default RegisterScreen;
