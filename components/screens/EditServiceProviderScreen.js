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
import { useTranslation } from 'react-i18next';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Context from '../../context/Context';
import CustomButton from '../CustomButton';
import LocationPicker from '../LocationPicker';
import { createSubscription, openRazorpayCheckout } from '../../service/paymentService';

const FIELD_KEYS = [
  { key: 'userName', labelKey: 'serviceProvider.userName', required: true, placeholderKey: 'serviceProvider.enterUserName' },
  { key: 'serviceProvided', labelKey: 'serviceProvider.serviceProvided', required: true, placeholderKey: 'serviceProvider.enterServiceProvided' },
  { key: 'phoneNumber', labelKey: 'serviceProvider.phoneNumber', required: false, placeholderKey: 'serviceProvider.enterPhoneNumber' },
  { key: 'address', labelKey: 'serviceProvider.address', required: false, placeholderKey: 'serviceProvider.enterAddress' },
];

const EditServiceProviderScreen = ({ navigation }) => {
  const { t } = useTranslation();
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

  // subscriptionEndDate null or <= now => show Pay ₹10
  const hasValidSubscription = () => {
    const end = auth.user?.userProfile?.subscriptionEndDate;
    if (end == null) return false;
    const endDate = new Date(end);
    if (isNaN(endDate.getTime())) return false;
    return endDate > new Date();
  };

  const payUserSubscription = async () => {
    setLoading(true);
    try {
      const { subscription_id, razorpay_key } = await createSubscription('SERVICE');
      await openRazorpayCheckout({
        key_id: razorpay_key,
        subscription_id,
        currency: 'INR',
        description: 'Service provider subscription (₹10/month, AutoPay)',
        prefill: {
          name: form.userName?.trim() || auth.user?.name,
          email: auth.user?.email || undefined,
          contact: form.phoneNumber?.trim() || auth.user?.phoneNumber || undefined,
        },
      });
      await auth.getMe();
      Alert.alert(t('common.success'), 'Subscription renewed. You will be charged monthly until you cancel.');
    } catch (e) {
      if (e.message !== 'Payment cancelled') Alert.alert(t('serviceProvider.paymentError'), e.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!auth.token || !profile) {
      Alert.alert(t('common.error'), t('serviceProvider.profileNotFound'));
      return;
    }

    const required = ['userName', 'serviceProvided', 'pincode', 'state', 'district', 'city'];
    const missing = required.filter((f) => !form[f]?.trim());
    if (missing.length) {
      const fieldLabels = missing.map((f) => t(`serviceProvider.${f}`));
      Alert.alert(t('common.error'), t('serviceProvider.pleaseFill', { fields: fieldLabels.join(', ') }));
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
          <Text style={[styles.errorText, { color: c.textSecondary }]}>{t('serviceProvider.profileNotFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    // <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: c.background }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t('serviceProvider.editTitle')}</Text>
        <Text style={[styles.fixedInfo, { color: c.textSecondary }]}>
          {phoneOrEmail ? t('serviceProvider.yourLoginPhone', { phone: phoneOrEmail }) : t('serviceProvider.enterPhoneBelow')}
        </Text>

        {!hasValidSubscription() && (
          <View style={[styles.payBanner, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={[styles.payBannerText, { color: c.text }]}>{t('serviceProvider.subscriptionInactive')}</Text>
            {loading ? (
              <ActivityIndicator size="small" color={c.accent} style={{ marginTop: 8 }} />
            ) : (
              <CustomButton title={t('serviceProvider.pay10Enable')} onPress={payUserSubscription} />
            )}
          </View>
        )}

        <View style={styles.imageSection}>
          <Text style={[styles.label, { color: c.text }]}>{t('serviceProvider.profileImage')}</Text>
          <TouchableOpacity
            style={[styles.imagePicker, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={pickImage}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="add-a-photo" size={40} color={c.textSecondary} />
                <Text style={[styles.imagePlaceholderText, { color: c.textSecondary }]}>{t('serviceProvider.tapToChangePhoto')}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {FIELD_KEYS.map(({ key, labelKey, required, placeholderKey }) => (
          <View key={key} style={styles.inputContainer}>
            <Text style={[styles.label, { color: c.text }]}>
              {t(labelKey)}{required ? t('serviceProvider.required') : ` ${t('serviceProvider.optional')}`}:
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
              placeholder={t(placeholderKey)}
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
          stateLabel={t('serviceProvider.state')}
          districtLabel={t('serviceProvider.district')}
          cityLabel={t('serviceProvider.city')}
        />

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: c.text }]}>{t('serviceProvider.pincode')}{t('serviceProvider.required')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
            placeholder={t('serviceProvider.enterPincode')}
            placeholderTextColor={c.textSecondary}
            value={form.pincode}
            onChangeText={(v) => updateForm('pincode', v)}
            keyboardType="phone-pad"
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={c.accent} style={styles.loader} />
        ) : (
          <CustomButton title={t('serviceProvider.saveChanges')} onPress={handleSubmit} />
        )}
        <View style={styles.inputContainer}></View>
        <View style={styles.inputContainer}></View>
        <View style={styles.inputContainer}></View>
        <View style={styles.inputContainer}></View>
      </ScrollView>
    // </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 16},
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  fixedInfo: { fontSize: 12, marginBottom: 16 },
  payBanner: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 16 },
  payBannerText: { fontSize: 14, marginBottom: 8 },
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
