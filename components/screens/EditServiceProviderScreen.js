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
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Context from '../../context/Context';
import CustomButton from '../CustomButton';
import LocationPicker from '../LocationPicker';

const EditServiceProviderScreen = ({ navigation }) => {
  const { auth, theme } = useContext(Context);
  const c = theme.colors;
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [form, setForm] = useState({
    userName: '',
    serviceProvided: '',
    phoneNumber: '',
    address: '',
    pincode: '',
    state: '',
    district: '',
    city: '',
  });

  const profile = auth.user?.userProfile;

  useEffect(() => {
    if (profile) {
      setForm({
        userName: profile.userName || '',
        serviceProvided: profile.serviceProvided || '',
        phoneNumber: profile.phoneNumber || auth.user?.phoneNumber || '',
        address: profile.address || '',
        pincode: profile.pincode || '',
        state: profile.state || '',
        district: profile.district || '',
        city: profile.city || '',
      });
    }
  }, [profile, auth.user?.phoneNumber]);

  const updateForm = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!auth.token || !profile) {
      Alert.alert('Error', 'Profile not found');
      return;
    }

    const required = ['userName', 'serviceProvided', 'pincode', 'state', 'district', 'city'];
    const missing = required.filter((f) => !form[f]?.trim());
    if (missing.length) {
      Alert.alert('Error', `Please fill: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (profileImage?.uri) {
        formData.append('image', {
          uri: profileImage.uri,
          type: profileImage.type || 'image/jpeg',
          name: profileImage.fileName || 'profile.jpg',
        });
      }
      formData.append('userName', form.userName.trim());
      formData.append('serviceProvided', form.serviceProvided.trim());
      if (form.phoneNumber?.trim()) formData.append('phoneNumber', form.phoneNumber.trim());
      if (form.address?.trim()) formData.append('address', form.address.trim());
      formData.append('pincode', form.pincode.trim());
      formData.append('state', form.state.trim());
      formData.append('district', form.district.trim());
      if (form.city?.trim()) formData.append('city', form.city.trim());

      await auth.updateServiceProvider(formData);
      Alert.alert('Success', 'Service provider profile updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const phoneOrEmail = auth.user?.phoneNumber || auth.user?.email || '';
  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert('Error', res.errorMessage || 'Failed to pick image');
        return;
      }
      if (res.assets?.[0]) setProfileImage(res.assets[0]);
    });
  };

  const imageUri = profileImage?.uri || profile?.profileImage;

  if (!profile) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: c.textSecondary }]}>No service provider profile found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: c.background }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Edit Service Provider</Text>
        <Text style={[styles.fixedInfo, { color: c.textSecondary }]}>
          {phoneOrEmail ? `Your login phone: ${phoneOrEmail}` : 'Enter phone number below'}
        </Text>

        <View style={styles.imageSection}>
          <Text style={[styles.label, { color: c.text }]}>Profile Image</Text>
          <TouchableOpacity
            style={[styles.imagePicker, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={pickImage}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="add-a-photo" size={40} color={c.textSecondary} />
                <Text style={[styles.imagePlaceholderText, { color: c.textSecondary }]}>Tap to change photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {[
          { key: 'userName', label: 'User Name', required: true },
          { key: 'serviceProvided', label: 'Service Provided', required: true },
          { key: 'phoneNumber', label: 'Phone Number', required: false },
          { key: 'address', label: 'Address', required: false },
        ].map(({ key, label, required }) => (
          <View key={key} style={styles.inputContainer}>
            <Text style={[styles.label, { color: c.text }]}>
              {label}{required ? ' *' : ' (Optional)'}:
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
              placeholder={`Enter ${label.toLowerCase()}`}
              placeholderTextColor={c.textSecondary}
              value={form[key]}
              onChangeText={(v) => updateForm(key, v)}
              keyboardType={key === 'phoneNumber' ? 'phone-pad' : 'default'}
            />
          </View>
        ))}

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
  inputContainer: { marginBottom: 12 },
  label: { fontWeight: '600', marginBottom: 4 },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  loader: { marginVertical: 24 },
  imageSection: { marginBottom: 16 },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: { fontSize: 12, marginTop: 4 },
});

export default EditServiceProviderScreen;
