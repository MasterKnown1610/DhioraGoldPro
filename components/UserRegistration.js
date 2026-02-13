import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Context from '../context/Context';
import CustomButton from './CustomButton';

const UserRegistration = () => {
  const { users } = useContext(Context);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    userName: '',
    serviceProvided: '',
    address: '',
    pincode: '',
    phoneNumber: '',
    state: '',
    district: '',
  });

  const updateForm = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const required = ['userName', 'serviceProvided'];
    const missing = required.filter((f) => !form[f]?.trim());
    if (missing.length) {
      Alert.alert('Error', `Please fill: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('userName', form.userName.trim());
      formData.append('serviceProvided', form.serviceProvided.trim());
      if (form.address?.trim()) formData.append('address', form.address.trim());
      if (form.pincode?.trim()) formData.append('pincode', form.pincode.trim());
      if (form.phoneNumber?.trim()) formData.append('phoneNumber', form.phoneNumber.trim());
      if (form.state?.trim()) formData.append('state', form.state.trim());
      if (form.district?.trim()) formData.append('district', form.district.trim());

      await users.registerUser(formData);
      Alert.alert('Success', 'User registered successfully');
      setForm({ userName: '', serviceProvided: '', address: '', pincode: '', phoneNumber: '', state: '', district: '' });
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to register user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>User Details</Text>
      {[
        { key: 'userName', label: 'User Name', required: true },
        { key: 'serviceProvided', label: 'Service Provided', required: true },
        { key: 'address', label: 'Address', required: false },
        { key: 'pincode', label: 'Pincode', required: false },
        { key: 'phoneNumber', label: 'Phone Number', required: false },
        { key: 'state', label: 'State', required: false },
        { key: 'district', label: 'District', required: false },
      ].map(({ key, label, required }) => (
        <View key={key} style={styles.inputContainer}>
          <Text style={styles.label}>{label}{required ? ' *' : ' (Optional)'}:</Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter ${label.toLowerCase()}`}
            value={form[key]}
            onChangeText={(v) => updateForm(key, v)}
            keyboardType={key === 'phoneNumber' || key === 'pincode' ? 'phone-pad' : 'default'}
          />
        </View>
      ))}

      {loading ? (
        <ActivityIndicator size="large" color="#F8C24D" style={styles.loader} />
      ) : (
        <CustomButton title="Register as User" onPress={handleSubmit} />
      )}
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  input: {
    height: 44,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  loader: {
    marginVertical: 24,
  },
});

export default UserRegistration;
