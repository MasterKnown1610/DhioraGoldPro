import React, { useState, useContext, useEffect } from 'react';
import Context from '../../context/Context';
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
import CustomButton from '../CustomButton';

const ChangePasswordScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { auth, theme } = useContext(Context);
  const c = theme.colors;
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!auth.token) {
      navigation.replace('Login');
    }
  }, [auth.token, navigation]);

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert(t('common.error'), t('changePassword.enterCurrentError'));
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert(t('common.error'), t('register.passwordMin'));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('changePassword.passwordsDontMatch'));
      return;
    }
    try {
      await auth.changePassword({
        currentPassword: currentPassword.trim(),
        newPassword,
      });
      Alert.alert(t('common.success'), t('changePassword.changeSuccess'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert(t('common.error'), e.message || 'Could not change password');
    }
  };

  if (!auth.token) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={[styles.title, { color: c.text }]}>{t('changePassword.title')}</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>{t('changePassword.subtitle')}</Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: c.text }]}>{t('changePassword.currentPassword')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
            placeholder={t('changePassword.enterCurrentPassword')}
            placeholderTextColor={c.textSecondary}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: c.text }]}>{t('changePassword.newPassword')}</Text>
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
          <Text style={[styles.label, { color: c.text }]}>{t('changePassword.confirmNewPassword')}</Text>
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
          <CustomButton title={t('changePassword.changeButton')} onPress={handleChangePassword} />
        )}

        <TouchableOpacity style={styles.forgotWrap} onPress={() => navigation.navigate('Forgot Password')}>
          <Text style={[styles.forgotLink, { color: c.accent }]}>{t('changePassword.forgotCurrent')}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 24 },
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
  forgotWrap: { marginTop: 20, alignSelf: 'center' },
  forgotLink: { fontSize: 14, fontWeight: '600' },
});

export default ChangePasswordScreen;
