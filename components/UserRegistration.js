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
import Context from '../context/Context';
import CustomButton from './CustomButton';
import LocationPicker from './LocationPicker';
import { createOrder, verifyPayment, openRazorpayCheckout } from '../service/paymentService';

const FIELD_KEYS = [
  { key: 'userName', labelKey: 'serviceProvider.userName', required: true, placeholderKey: 'serviceProvider.enterUserName' },
  { key: 'serviceProvided', labelKey: 'serviceProvider.serviceProvided', required: true, placeholderKey: 'serviceProvider.enterServiceProvided' },
  { key: 'phoneNumber', labelKey: 'serviceProvider.phoneNumber', required: false, placeholderKey: 'serviceProvider.enterPhoneNumber' },
  { key: 'address', labelKey: 'serviceProvider.address', required: false, placeholderKey: 'serviceProvider.enterAddress' },
];

const UserRegistration = ({ navigation }) => {
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

  useEffect(() => {
    if (auth.user?.phoneNumber && !form.phoneNumber) {
      setForm((p) => ({ ...p, phoneNumber: auth.user.phoneNumber }));
    }
  }, [auth.user?.phoneNumber]);

  const updateForm = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Valid only when subscriptionEndDate is set and after current date (not null, not expired)
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
      const orderData = await createOrder('user_subscription');
      const paymentData = await openRazorpayCheckout({
        key_id: orderData.key_id,
        razorpayOrderId: orderData.razorpayOrderId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        description: 'Service provider subscription (₹10)',
      });
      await verifyPayment({
        orderId: orderData.orderId,
        type: 'user_subscription',
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      });
      await auth.getMe();
      return true;
    } catch (e) {
      if (e.message !== 'Payment cancelled') Alert.alert(t('serviceProvider.paymentError'), e.message || 'Payment failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!auth.token) {
      Alert.alert(t('serviceProvider.loginRequired'), t('serviceProvider.pleaseLoginFirst'));
      navigation.navigate('Login');
      return;
    }
    const required = ['userName', 'serviceProvided', 'pincode', 'state', 'district', 'city'];
    const effectivePhone = form.phoneNumber?.trim() || auth.user?.phoneNumber;
    if (!effectivePhone) {
      Alert.alert(t('serviceProvider.phoneRequired'), t('serviceProvider.pleaseEnterPhone'));
      return;
    }
    const missing = required.filter((f) => !form[f]?.trim());
    if (missing.length) {
      const fieldLabels = missing.map((f) => t(`serviceProvider.${f}`));
      Alert.alert(t('common.error'), t('serviceProvider.pleaseFill', { fields: fieldLabels.join(', ') }));
      return;
    }

    const hasProfile = !!auth.user?.userProfile;
    const needsPayment = !hasValidSubscription();

    if (needsPayment) {
      const paid = await payUserSubscription();
      if (!paid) return;
      if (hasProfile) {
        Alert.alert(t('common.success'), t('serviceProvider.subscriptionRenewed'));
        return;
      }
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

      if (hasProfile) {
        await auth.updateServiceProvider(formData);
        Alert.alert('Success', 'Profile updated.');
      } else {
        await auth.registerServiceProvider(formData);
        Alert.alert('Success', 'Service provider profile created. You appear in the Users list.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        setForm({ userName: '', serviceProvided: '', phoneNumber: '', address: '', pincode: '', state: '', district: '', city: '' });
        setProfileImage(null);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

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

  const phoneOrEmail = auth.user?.phoneNumber || auth.user?.email || '';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: c.background }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t('serviceProvider.registerTitle')}</Text>
        <Text style={[styles.fixedInfo, { color: c.textSecondary }]}>
          {phoneOrEmail ? t('serviceProvider.yourLoginPhone', { phone: phoneOrEmail }) : t('serviceProvider.enterPhoneBelow')}
        </Text>
        {auth.user?.userProfile && !hasValidSubscription() && (
          <View style={[styles.payBanner, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={[styles.payBannerText, { color: c.text }]}>{t('serviceProvider.subscriptionExpired')}</Text>
            {loading ? (
              <ActivityIndicator size="small" color={c.accent} style={{ marginTop: 8 }} />
            ) : (
              <CustomButton title={t('serviceProvider.pay10Enable')} onPress={payUserSubscription} />
            )}
          </View>
        )}
        {!auth.user?.userProfile && (
          <Text style={[styles.fixedInfo, { color: c.textSecondary }]}>{t('serviceProvider.oneTimeFee10')}</Text>
        )}

        <View style={styles.imageSection}>
          <Text style={[styles.label, { color: c.text }]}>{t('serviceProvider.profileImageOptional')}</Text>
          <TouchableOpacity
            style={[styles.imagePicker, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={pickImage}
          >
            {profileImage?.uri ? (
              <Image source={{ uri: profileImage.uri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="add-a-photo" size={40} color={c.textSecondary} />
                <Text style={[styles.imagePlaceholderText, { color: c.textSecondary }]}>{t('serviceProvider.tapToAddPhoto')}</Text>
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
              editable={!!auth.token}
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
            editable={!!auth.token}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={c.accent} style={styles.loader} />
        ) : (
          <CustomButton
            title={auth.user?.userProfile ? t('serviceProvider.updateProfile') : t('serviceProvider.pay10Register')}
            onPress={handleSubmit}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 16 },
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

export default UserRegistration;
