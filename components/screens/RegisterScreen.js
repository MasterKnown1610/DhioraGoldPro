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

const RegisterScreen = ({ navigation }) => {
  const { auth, theme } = useContext(Context);
  const c = theme.colors;
  const [registerWithEmail, setRegisterWithEmail] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

  const handleRegister = async () => {
    const payload = registerWithEmail
      ? { name: form.name.trim(), email: form.email.trim(), password: form.password }
      : { name: form.name.trim(), phoneNumber: form.phoneNumber.trim(), password: form.password };

    if (!form.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (registerWithEmail && !form.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!registerWithEmail && !form.phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await auth.register(payload);
      Alert.alert('Success', 'Account created. You can now register as service provider or shop from Profile.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Registration Failed', e.message || 'Could not create account');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={[styles.title, { color: c.text }]}>Register</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Create your account. You can add service provider or shop profile later.
        </Text>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, !registerWithEmail && { backgroundColor: c.accent }]}
            onPress={() => setRegisterWithEmail(false)}
          >
            <Text style={[styles.toggleText, { color: !registerWithEmail ? '#000' : c.textSecondary }]}>Phone</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, registerWithEmail && { backgroundColor: c.accent }]}
            onPress={() => setRegisterWithEmail(true)}
          >
            <Text style={[styles.toggleText, { color: registerWithEmail ? '#000' : c.textSecondary }]}>Email</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: c.text }]}>Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
            placeholder="Your name"
            placeholderTextColor={c.textSecondary}
            value={form.name}
            onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
          />
        </View>

        {registerWithEmail ? (
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: c.text }]}>Email *</Text>
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
            <Text style={[styles.label, { color: c.text }]}>Phone Number *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
              placeholder="Phone number"
              placeholderTextColor={c.textSecondary}
              value={form.phoneNumber}
              onChangeText={(v) => setForm((p) => ({ ...p, phoneNumber: v }))}
              keyboardType="phone-pad"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: c.text }]}>Password (min 6 chars) *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
            placeholder="Password"
            placeholderTextColor={c.textSecondary}
            value={form.password}
            onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
            secureTextEntry
          />
        </View>

        {auth.loading ? (
          <ActivityIndicator size="large" color={c.accent} style={styles.loader} />
        ) : (
          <CustomButton title="Register" onPress={handleRegister} />
        )}

        <View style={styles.registerLinks}>
          <Text style={[styles.registerText, { color: c.textSecondary }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.registerLink, { color: c.accent }]}>Login</Text>
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

export default RegisterScreen;
