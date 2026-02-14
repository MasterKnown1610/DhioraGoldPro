import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Linking,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Context from '../../context/Context';

const DEFAULT_MESSAGE = 'Hi, I would like to connect regarding your services.';

const UserDetailsScreen = ({ route, navigation }) => {
  const { theme, users } = useContext(Context);
  const c = theme.colors;
  const passedUser = route?.params?.user || {};
  const userId = route?.params?.userId;
  const needsFetch = !!userId && !passedUser?.userName;
  const [loading, setLoading] = useState(needsFetch);

  const user = passedUser?.userName ? passedUser : (users.singleUser || passedUser);

  useEffect(() => {
    if (needsFetch && userId) {
      users.getUserById(userId).finally(() => setLoading(false));
    }
  }, [userId, needsFetch]);

  const phone = user?.phoneNumber;

  const openWhatsApp = () => {
    const num = (phone || '').replace(/\D/g, '');
    if (num) {
      const text = encodeURIComponent(DEFAULT_MESSAGE);
      Linking.openURL(`https://wa.me/${num}?text=${text}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const displayName = user?.userName || user?.name;
  const profession = user?.serviceProvided || user?.profession;
  const location = [user?.address, user?.district, user?.state].filter(Boolean).join(', ') || user?.location;
  const servicePhilosophy = user?.servicePhilosophy || user?.serviceProvided || 'Service provider.';
  const serviceArea = user?.serviceArea || [user?.district, user?.state].filter(Boolean).join(' & ') || '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Icon name="arrow-back" size={24} color={c.accent} />
        </TouchableOpacity>

        <View style={styles.profileSection}>
          <View style={[styles.avatarWrapper, { borderColor: c.accent }]}>
            {(user?.profileImage || user?.image) ? (
              <Image source={{ uri: user.profileImage || user.image }} style={styles.avatar} resizeMode="cover" />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: c.surfaceSecondary }]}>
                <Icon name="person" size={64} color={c.accent} />
              </View>
            )}
          </View>
          <Text style={[styles.name, { color: c.text }]}>{displayName}</Text>
          <Text style={[styles.profession, { color: c.accent }]}>{profession}</Text>
          {location ? (
            <View style={styles.locationRow}>
              <Icon name="location-on" size={16} color={c.text} />
              <Text style={[styles.location, { color: c.text }]}>{location}</Text>
            </View>
          ) : null}
        </View>

        {phone ? (
          <View style={[styles.contactCard, { backgroundColor: c.surface }]}>
            <Text style={[styles.phoneLabel, { color: c.textSecondary }]}>Contact</Text>
            <Text style={[styles.phoneNumber, { color: c.text }]}>{phone}</Text>
            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: c.accent }]}
              onPress={openWhatsApp}
              activeOpacity={0.85}
            >
              <Text style={[styles.loginBtnText, { color: c.accentText }]}>MESSAGE ON WHATSAPP</Text>
              <Icon name="arrow-forward" size={18} color={c.accentText} />
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={[styles.sectionTitle, { color: c.accent }]}>SERVICE PROVIDED</Text>
        <Text style={[styles.sectionText, { color: c.text }]}>{servicePhilosophy}</Text>

        {serviceArea ? (
          <>
            <Text style={[styles.sectionTitle, { color: c.accent }]}>SERVICE AREA</Text>
            {/* <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800' }}
              style={[styles.mapArea, { backgroundColor: c.surface }]}
              imageStyle={styles.mapImage}
            > */}
              <View style={styles.mapOverlay}>
                <View style={[styles.mapDot, { backgroundColor: c.accent }]} />
                <Text style={[styles.mapText, { color: c.text }]}>{serviceArea}</Text>
              </View>
            {/* </ImageBackground> */}
          </>
        ) : null}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: c.surface }]}
            onPress={openWhatsApp}
            activeOpacity={0.85}
          >
            <Icon name="chat-bubble-outline" size={22} color={c.text} style={styles.actionIcon} />
            <Text style={[styles.actionText, { color: c.text }]}>MESSAGE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: c.surface }]}
            onPress={() => {}}
            activeOpacity={0.85}
          >
            <Icon name="event" size={22} color={c.text} style={styles.actionIcon} />
            <Text style={[styles.actionText, { color: c.text }]}>SCHEDULE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  backBtn: {
    position: 'absolute',
    top: 8,
    left: 16,
    zIndex: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  profession: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  location: {
    fontSize: 14,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  blurredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  blurredText: {
    fontSize: 16,
    letterSpacing: 2,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  loginBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  premiumLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  phoneLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24,
  },
  mapArea: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    justifyContent: 'flex-end',
  },
  mapImage: {
    borderRadius: 16,
    opacity: 0.7,
  },
  mapOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  mapDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  mapText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default UserDetailsScreen;
