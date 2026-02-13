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

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const initialOpeningHours = () =>
  DAYS.reduce((acc, { key }) => ({ ...acc, [key]: { open: '', close: '' } }), {});

const ShopRegistration = () => {
  const { shops } = useContext(Context);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shopName: '',
    address: '',
    pincode: '',
    phoneNumber: '',
    whatsappNumber: '',
    state: '',
    district: '',
  });
  const [openingHours, setOpeningHours] = useState(initialOpeningHours());

  const updateForm = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateOpeningHours = (day, field, value) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    const required = ['shopName', 'address', 'pincode', 'phoneNumber', 'state', 'district'];
    const missing = required.filter((f) => !form[f]?.trim());
    if (missing.length) {
      Alert.alert('Error', `Please fill: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('shopName', form.shopName.trim());
      formData.append('address', form.address.trim());
      formData.append('pincode', form.pincode.trim());
      formData.append('phoneNumber', form.phoneNumber.trim());
      formData.append('state', form.state.trim());
      formData.append('district', form.district.trim());
      if (form.whatsappNumber?.trim()) {
        formData.append('whatsappNumber', form.whatsappNumber.trim());
      }

      const hasHours = DAYS.some(({ key }) => openingHours[key]?.open || openingHours[key]?.close);
      if (hasHours) {
        const hoursObj = {};
        DAYS.forEach(({ key }) => {
          const open = openingHours[key]?.open?.trim() || '';
          const close = openingHours[key]?.close?.trim() || '';
          if (open || close) hoursObj[key] = { open, close };
        });
        formData.append('openingHours', JSON.stringify(hoursObj));
      }

      await shops.registerShop(formData);
      Alert.alert('Success', 'Shop registered successfully');
      setForm({ shopName: '', address: '', pincode: '', phoneNumber: '', whatsappNumber: '', state: '', district: '' });
      setOpeningHours(initialOpeningHours());
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to register shop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Shop Details</Text>
      {[
        { key: 'shopName', label: 'Shop Name' },
        { key: 'address', label: 'Address' },
        { key: 'pincode', label: 'Pincode' },
        { key: 'phoneNumber', label: 'Phone Number' },
        { key: 'whatsappNumber', label: 'WhatsApp Number (Optional)' },
        { key: 'state', label: 'State' },
        { key: 'district', label: 'District' },
      ].map(({ key, label }) => (
        <View key={key} style={styles.inputContainer}>
          <Text style={styles.label}>{label}:</Text>
          <TextInput
            style={styles.input}
            placeholder={key === 'whatsappNumber' ? 'Optional' : `Enter ${label.toLowerCase()}`}
            value={form[key]}
            onChangeText={(v) => updateForm(key, v)}
            keyboardType={key.includes('Number') || key === 'pincode' ? 'phone-pad' : 'default'}
          />
        </View>
      ))}

      <Text style={[styles.sectionTitle, styles.marginTop]}>Opening Hours (Optional)</Text>
      <Text style={styles.hint}>Use 24h format, e.g. 09:00, 18:00. Leave empty for closed days.</Text>
      {DAYS.map(({ key, label }) => (
        <View key={key} style={styles.dayRow}>
          <Text style={styles.dayLabel}>{label}</Text>
          <TextInput
            style={[styles.timeInput, styles.openInput]}
            placeholder="Open"
            value={openingHours[key]?.open || ''}
            onChangeText={(v) => updateOpeningHours(key, 'open', v)}
            placeholderTextColor="#999"
          />
          <Text style={styles.toText}>to</Text>
          <TextInput
            style={[styles.timeInput, styles.closeInput]}
            placeholder="Close"
            value={openingHours[key]?.close || ''}
            onChangeText={(v) => updateOpeningHours(key, 'close', v)}
            placeholderTextColor="#999"
          />
        </View>
      ))}

      {loading ? (
        <ActivityIndicator size="large" color="#F8C24D" style={styles.loader} />
      ) : (
        <CustomButton title="Register Shop" onPress={handleSubmit} />
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
  marginTop: {
    marginTop: 24,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
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
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  dayLabel: {
    width: 90,
    fontWeight: '600',
    color: '#333',
    fontSize: 14,
  },
  timeInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    flex: 1,
  },
  openInput: {
    flex: 1,
  },
  closeInput: {
    flex: 1,
  },
  toText: {
    fontSize: 12,
    color: '#666',
    width: 20,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 24,
  },
});

export default ShopRegistration;
