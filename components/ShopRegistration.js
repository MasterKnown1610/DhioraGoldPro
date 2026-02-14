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
  Image,
  TouchableOpacity,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Context from '../context/Context';
import CustomButton from './CustomButton';
import LocationPicker from './LocationPicker';

const MAX_IMAGES = 5;

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

const ShopRegistration = ({ navigation }) => {
  const { auth, theme } = useContext(Context);
  const c = theme.colors;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shopName: '',
    address: '',
    pincode: '',
    whatsappNumber: '',
    state: '',
    district: '',
    city: '',
  });
  const [shopImages, setShopImages] = useState([]);
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
    if (!auth.token) {
      Alert.alert('Login Required', 'Please login first to register a shop.');
      navigation.navigate('Login');
      return;
    }
    if (!auth.user?.phoneNumber) {
      Alert.alert('Phone Required', 'Please log in with a phone number to register a shop.');
      return;
    }

    const required = ['shopName', 'address', 'pincode', 'state', 'district', 'city'];
    const missing = required.filter((f) => !form[f]?.trim());
    if (missing.length) {
      Alert.alert('Error', `Please fill: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      shopImages.forEach((img) => {
        formData.append('images', {
          uri: img.uri,
          type: img.type || 'image/jpeg',
          name: img.fileName || `shop-${Date.now()}.jpg`,
        });
      });
      formData.append('shopName', form.shopName.trim());
      formData.append('address', form.address.trim());
      formData.append('pincode', form.pincode.trim());
      formData.append('state', form.state.trim());
      formData.append('district', form.district.trim());
      if (form.city?.trim()) formData.append('city', form.city.trim());
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

      await auth.registerShop(formData);
      Alert.alert('Success', 'Shop registered successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      setForm({
        shopName: '',
        address: '',
        pincode: '',
        whatsappNumber: '',
        state: '',
        district: '',
        city: '',
      });
      setShopImages([]);
      setOpeningHours(initialOpeningHours());
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to register shop');
    } finally {
      setLoading(false);
    }
  };

  const phoneOrEmail = auth.user?.phoneNumber || auth.user?.email || '';

  const pickShopImages = () => {
    const remaining = MAX_IMAGES - shopImages.length;
    if (remaining <= 0) {
      Alert.alert('Limit', `Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    launchImageLibrary({ mediaType: 'photo', selectionLimit: remaining, quality: 0.8 }, (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert('Error', res.errorMessage || 'Failed to pick images');
        return;
      }
      if (res.assets?.length) {
        setShopImages((prev) => [...prev, ...res.assets].slice(0, MAX_IMAGES));
      }
    });
  };

  const removeShopImage = (index) => {
    setShopImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
    <ScrollView style={[styles.container, { backgroundColor: c.background }]}>
      <Text style={[styles.sectionTitle, { color: c.text }]}>Register as Shop</Text>
      <Text style={[styles.fixedInfo, { color: c.textSecondary }]}>
        Phone: {phoneOrEmail || '— (log in with phone to register)'}
      </Text>
      <View style={styles.imageSection}>
        <Text style={[styles.label, { color: c.text }]}>Shop Images (Optional, max {MAX_IMAGES})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
          {shopImages.map((img, index) => (
            <View key={index} style={styles.imageItem}>
              <Image source={{ uri: img.uri }} style={styles.shopImagePreview} />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => removeShopImage(index)}
              >
                <Icon name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {shopImages.length < MAX_IMAGES && (
            <TouchableOpacity
              style={[styles.addImageBtn, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={pickShopImages}
            >
              <Icon name="add-a-photo" size={32} color={c.textSecondary} />
              <Text style={[styles.addImageText, { color: c.textSecondary }]}>Add</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: c.text }]}>Shop Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
          placeholder="Enter shop name"
          placeholderTextColor={c.textSecondary}
          value={form.shopName}
          onChangeText={(v) => updateForm('shopName', v)}
          editable={!!auth.token}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: c.text }]}>Address *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
          placeholder="Enter address"
          placeholderTextColor={c.textSecondary}
          value={form.address}
          onChangeText={(v) => updateForm('address', v)}
          editable={!!auth.token}
        />
      </View>

      <LocationPicker
        state={form.state}
        district={form.district}
        city={form.city}
        onStateChange={(v) => updateForm('state', v)}
        onDistrictChange={(v) => updateForm('district', v)}
        onCityChange={(v) => updateForm('city', v)}
        colors={c}
      />

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: c.text }]}>Pincode *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
          placeholder="Enter pincode"
          placeholderTextColor={c.textSecondary}
          value={form.pincode}
          onChangeText={(v) => updateForm('pincode', v)}
          keyboardType="phone-pad"
          editable={!!auth.token}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: c.text }]}>WhatsApp Number (Optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
          placeholder="Optional"
          placeholderTextColor={c.textSecondary}
          value={form.whatsappNumber}
          onChangeText={(v) => updateForm('whatsappNumber', v)}
          keyboardType="phone-pad"
          editable={!!auth.token}
        />
      </View>

      <Text style={[styles.sectionTitle, styles.marginTop, { color: c.text }]}>Opening Hours (Optional)</Text>
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
  },
  fixedInfo: {
    fontSize: 12,
    marginBottom: 16,
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
  imageSection: {
    marginBottom: 16,
  },
  imageList: {
    flexGrow: 0,
    marginTop: 8,
  },
  imageItem: {
    marginRight: 12,
    position: 'relative',
  },
  shopImagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default ShopRegistration;
