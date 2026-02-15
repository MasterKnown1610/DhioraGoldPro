import React, { useState, useContext, useEffect } from 'react';
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
  Modal,
  FlatList,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Context from '../../context/Context';
import CustomButton from '../CustomButton';
import LocationPicker from '../LocationPicker';

const MAX_IMAGES = 5;

const TIME_OPTIONS = (() => {
  const options = [''];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return options;
})();

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

const EditShopScreen = ({ navigation }) => {
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
  const [timePicker, setTimePicker] = useState(null);

  const profile = auth.user?.shopProfile;

  useEffect(() => {
    if (profile) {
      setForm({
        shopName: profile.shopName || '',
        address: profile.address || '',
        pincode: profile.pincode || '',
        whatsappNumber: profile.whatsappNumber || '',
        state: profile.state || '',
        district: profile.district || '',
        city: profile.city || '',
      });
      const hours = profile.openingHours || {};
      const merged = initialOpeningHours();
      DAYS.forEach(({ key }) => {
        if (hours[key]) {
          merged[key] = {
            open: hours[key].open || '',
            close: hours[key].close || '',
          };
        }
      });
      setOpeningHours(merged);
    }
  }, [profile]);

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
    if (!auth.token || !profile) {
      Alert.alert('Error', 'Shop profile not found');
      return;
    }

    const required = ['shopName', 'address', 'pincode', 'state', 'district'];
    const missing = required.filter((f) => !form[f]?.trim());
    if (missing.length) {
      Alert.alert('Error', `Please fill: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      shopImages.forEach((img) => {
        if (img.uri) {
          formData.append('images', {
            uri: img.uri,
            type: img.type || 'image/jpeg',
            name: img.fileName || `shop-${Date.now()}.jpg`,
          });
        }
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

      await auth.updateShop(formData);
      Alert.alert('Success', 'Shop profile updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update');
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

  if (!profile) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: c.textSecondary }]}>No shop profile found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const existingImages = profile.images || [];
  const displayImages = shopImages.length > 0 ? shopImages : existingImages.map((url) => ({ uri: url }));
  const canRemoveImages = shopImages.length > 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: c.background }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Edit Shop</Text>
        <Text style={[styles.fixedInfo, { color: c.textSecondary }]}>
          Phone: {phoneOrEmail}
        </Text>

        <View style={styles.imageSection}>
          <Text style={[styles.label, { color: c.text }]}>Shop Images (max {MAX_IMAGES})</Text>
          <Text style={[styles.hint, { color: c.textSecondary }]}>Add new images to replace existing ones</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
            {displayImages.map((img, index) => (
              <View key={index} style={styles.imageItem}>
                <Image
                  source={{ uri: typeof img === 'string' ? img : img.uri }}
                  style={styles.shopImagePreview}
                />
                {canRemoveImages ? (
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => removeShopImage(index)}
                  >
                    <Icon name="close" size={18} color="#fff" />
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
            {shopImages.length === 0 ? (
              <TouchableOpacity
                style={[styles.addImageBtn, { backgroundColor: c.surface, borderColor: c.border }]}
                onPress={pickShopImages}
              >
                <Icon name="add-a-photo" size={32} color={c.textSecondary} />
                <Text style={[styles.addImageText, { color: c.textSecondary }]}>Add / Replace</Text>
              </TouchableOpacity>
            ) : shopImages.length < MAX_IMAGES ? (
              <TouchableOpacity
                style={[styles.addImageBtn, { backgroundColor: c.surface, borderColor: c.border }]}
                onPress={pickShopImages}
              >
                <Icon name="add-a-photo" size={32} color={c.textSecondary} />
                <Text style={[styles.addImageText, { color: c.textSecondary }]}>Add</Text>
              </TouchableOpacity>
            ) : null}
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
          />
        </View>

        <Text style={[styles.sectionTitle, styles.marginTop, { color: c.text }]}>Opening Hours</Text>
        <Text style={[styles.hint, { color: c.textSecondary }]}>Tap Open/Close to pick time</Text>
        {DAYS.map(({ key, label }) => (
          <View key={key} style={styles.dayRow}>
            <Text style={[styles.dayLabel, { color: c.text }]}>{label}</Text>
            <TouchableOpacity
              style={[styles.timeInput, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={() => setTimePicker({ day: key, field: 'open' })}
              activeOpacity={0.7}
            >
              <Text style={[styles.timeInputText, { color: (openingHours[key]?.open && c.text) || c.textSecondary }]}>
                {openingHours[key]?.open || 'Open'}
              </Text>
              <Icon name="schedule" size={18} color={c.textSecondary} style={styles.timeInputIcon} />
            </TouchableOpacity>
            <Text style={[styles.toText, { color: c.textSecondary }]}>to</Text>
            <TouchableOpacity
              style={[styles.timeInput, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={() => setTimePicker({ day: key, field: 'close' })}
              activeOpacity={0.7}
            >
              <Text style={[styles.timeInputText, { color: (openingHours[key]?.close && c.text) || c.textSecondary }]}>
                {openingHours[key]?.close || 'Close'}
              </Text>
              <Icon name="schedule" size={18} color={c.textSecondary} style={styles.timeInputIcon} />
            </TouchableOpacity>
          </View>
        ))}

        <Modal visible={!!timePicker} transparent animationType="slide">
          <TouchableOpacity style={styles.timePickerOverlay} activeOpacity={1} onPress={() => setTimePicker(null)}>
            <View style={[styles.timePickerContent, { backgroundColor: c.surface }]} onStartShouldSetResponder={() => true}>
              <View style={[styles.timePickerHeader, { borderBottomColor: c.border }]}>
                <Text style={[styles.timePickerTitle, { color: c.text }]}>
                  {timePicker ? `${timePicker.field === 'open' ? 'Open' : 'Close'} time` : ''}
                </Text>
                <TouchableOpacity onPress={() => setTimePicker(null)} hitSlop={12}>
                  <Icon name="close" size={24} color={c.textSecondary} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={TIME_OPTIONS}
                keyExtractor={(item) => item || 'closed'}
                style={styles.timePickerList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.timePickerOption, { borderBottomColor: c.border }]}
                    onPress={() => {
                      updateOpeningHours(timePicker.day, timePicker.field, item);
                      setTimePicker(null);
                    }}
                  >
                    <Text style={[styles.timePickerOptionText, { color: c.text }]}>{item || 'Closed'}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {loading ? (
          <ActivityIndicator size="large" color={c.accent} style={styles.loader} />
        ) : (
          <CustomButton title="Save Changes" onPress={handleSubmit} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  fixedInfo: { fontSize: 12, marginBottom: 16 },
  hint: { fontSize: 12, marginBottom: 8 },
  marginTop: { marginTop: 24 },
  inputContainer: { marginBottom: 12 },
  label: { fontWeight: '600', marginBottom: 4 },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  dayRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  dayLabel: { width: 90, fontWeight: '600', fontSize: 14 },
  timeInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeInputText: { fontSize: 14 },
  timeInputIcon: { marginLeft: 4 },
  toText: { fontSize: 12, width: 20, textAlign: 'center' },
  timePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  timePickerContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '50%',
    paddingBottom: 24,
  },
  timePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  timePickerTitle: { fontSize: 18, fontWeight: 'bold' },
  timePickerList: { maxHeight: 320 },
  timePickerOption: {
    padding: 16,
    borderBottomWidth: 1,
  },
  timePickerOptionText: { fontSize: 16 },
  loader: { marginVertical: 24 },
  imageSection: { marginBottom: 16 },
  imageList: { flexGrow: 0, marginTop: 8 },
  imageItem: { marginRight: 12, position: 'relative' },
  shopImagePreview: { width: 80, height: 80, borderRadius: 8 },
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
  addImageText: { fontSize: 12, marginTop: 4 },
});

export default EditShopScreen;
