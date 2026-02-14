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
import Context from '../../context/Context';
import CustomButton from '../CustomButton';

const LoginScreen = ({ navigation }) => {
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
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!loginWithEmail && !phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    try {
      await auth.login(payload);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Login Failed', e.message || 'Invalid credentials');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={[styles.title, { color: c.text }]}>Login</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Sign in with your account. After login you can register as service provider or shop.
        </Text>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, !loginWithEmail && { backgroundColor: c.accent }]}
            onPress={() => setLoginWithEmail(false)}
          >
            <Text style={[styles.toggleText, { color: !loginWithEmail ? '#000' : c.textSecondary }]}>Phone</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, loginWithEmail && { backgroundColor: c.accent }]}
            onPress={() => setLoginWithEmail(true)}
          >
            <Text style={[styles.toggleText, { color: loginWithEmail ? '#000' : c.textSecondary }]}>Email</Text>
          </TouchableOpacity>
        </View>

        {loginWithEmail ? (
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: c.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
              placeholder="Enter email"
              placeholderTextColor={c.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: c.text }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
              placeholder="Enter phone number"
              placeholderTextColor={c.textSecondary}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: c.text }]}>Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
            placeholder="Enter password"
            placeholderTextColor={c.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {auth.loading ? (
          <ActivityIndicator size="large" color={c.accent} style={styles.loader} />
        ) : (
          <CustomButton title="Login" onPress={handleLogin} />
        )}

        <View style={styles.registerLinks}>
          <Text style={[styles.registerText, { color: c.textSecondary }]}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.registerLink, { color: c.accent }]}>Register</Text>
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
  registerLinks: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  registerText: { fontSize: 14 },
  registerLink: { fontSize: 14, fontWeight: '600' },
});

export default LoginScreen;
