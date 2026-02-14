import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../CustomButton';
import Context from '../../context/Context';

const ProfileScreen = ({ navigation }) => {
  const { auth, theme } = useContext(Context);
  const c = theme.colors;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: auth.logout },
    ]);
  };

  const displayName =
    auth.user?.userProfile?.userName || auth.user?.name || auth.user?.email || auth.user?.phoneNumber || 'Guest';
  const hasUserProfile = !!auth.user?.userProfile;
  const hasShopProfile = !!auth.user?.shopProfile;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.avatar, { backgroundColor: c.surface }]}>
          <Icon name="person" size={64} color={c.textSecondary} />
        </View>
        <Text style={[styles.title, { color: c.text }]}>Profile</Text>
        <Text style={[styles.userNameLabel, { color: c.textSecondary }]}>Name</Text>
        <Text style={[styles.userName, { color: c.text }]}>{displayName}</Text>
        {(auth.user?.email || auth.user?.phoneNumber) ? (
          <Text style={[styles.contactInfo, { color: c.textSecondary }]}>
            {auth.user.email || auth.user.phoneNumber}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.themeToggle, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={theme.toggleTheme}
        >
          <Icon name={theme.isDark ? 'wb-sunny' : 'nights-stay'} size={24} color={c.accent} style={{ marginRight: 10 }} />
          <Text style={[styles.themeToggleText, { color: c.text }]}>
            {theme.isDark ? 'Light Mode' : 'Dark Mode'}
          </Text>
        </TouchableOpacity>

        {auth.token ? (
          <View style={styles.registerSection}>
            {/* Linked profiles */}
            {hasUserProfile && (
              <View style={[styles.profileCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Icon name="engineering" size={24} color={c.accent} />
                <View style={styles.profileCardContent}>
                  <Text style={[styles.profileCardTitle, { color: c.text }]}>Service Provider</Text>
                  <Text style={[styles.profileCardDetail, { color: c.textSecondary }]}>
                    {auth.user.userProfile?.userName} – {auth.user.userProfile?.serviceProvided}
                  </Text>
                  <TouchableOpacity
                    style={[styles.editBtn, { borderColor: c.accent }]}
                    onPress={() => navigation.navigate('Edit Service Provider')}
                  >
                    <Icon name="edit" size={16} color={c.accent} />
                    <Text style={[styles.editBtnText, { color: c.accent }]}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {hasShopProfile && (
              <View style={[styles.profileCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Icon name="storefront" size={24} color={c.accent} />
                <View style={styles.profileCardContent}>
                  <Text style={[styles.profileCardTitle, { color: c.text }]}>Shop</Text>
                  <Text style={[styles.profileCardDetail, { color: c.textSecondary }]}>
                    {auth.user.shopProfile?.shopName} – {auth.user.shopProfile?.address}
                  </Text>
                  <TouchableOpacity
                    style={[styles.editBtn, { borderColor: c.accent }]}
                    onPress={() => navigation.navigate('Edit Shop')}
                  >
                    <Icon name="edit" size={16} color={c.accent} />
                    <Text style={[styles.editBtnText, { color: c.accent }]}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: c.text }]}>Add or manage profiles</Text>
            {!hasUserProfile && (
              <>
                <CustomButton
                  title="Register as Service Provider"
                  onPress={() => navigation.navigate('Register Service Provider')}
                />
                <View style={styles.buttonSpacer} />
              </>
            )}
            {!hasShopProfile && (
              <>
                <CustomButton
                  title="Register as Shop"
                  onPress={() => navigation.navigate('Register Shop')}
                />
                <View style={styles.buttonSpacer} />
              </>
            )}
            <CustomButton title="Logout" onPress={handleLogout} />
          </View>
        ) : (
          <View style={styles.registerSection}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Login or Register</Text>
            <CustomButton title="Login" onPress={() => navigation.navigate('Login')} />
            <View style={styles.buttonSpacer} />
            <CustomButton title="Register" onPress={() => navigation.navigate('Register')} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flexGrow: 1, alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    width: '85%',
    borderWidth: 1,
  },
  themeToggleText: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold', marginTop: 16 },
  userNameLabel: { fontSize: 12, marginTop: 12, fontWeight: '600', letterSpacing: 0.5 },
  userName: { fontSize: 18, fontWeight: '600', marginTop: 4 },
  contactInfo: { fontSize: 12, marginTop: 4 },
  registerSection: { width: '85%', marginTop: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  buttonSpacer: { height: 12 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    width: '100%',
  },
  profileCardContent: { marginLeft: 12, flex: 1 },
  profileCardTitle: { fontSize: 16, fontWeight: '600' },
  profileCardDetail: { fontSize: 12, marginTop: 4 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  editBtnText: { fontSize: 14, fontWeight: '600' },
});

export default ProfileScreen;
