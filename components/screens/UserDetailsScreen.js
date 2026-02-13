import React, { useContext } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Context from '../../context/Context';

const WHATSAPP_NUMBER = '919505143534';
const DEFAULT_MESSAGE = 'Hi, I would like to connect regarding your services.';

const DEFAULT_USER = {
  id: '0',
  name: 'Alexander Sterling',
  profession: 'BESPOKE ARCHITECTURAL CONSULTANT',
  location: 'Upper East Side, New York, NY',
  experience: '15 Yrs',
  rating: 4.9,
  projects: '120+',
  servicePhilosophy:
    'Crafting timeless spaces through the intersection of classical aesthetics and modern functionality. Specializing in high-end residential estates and private boutique commercial developments across the Tri-State area.',
  serviceArea: 'AVAILABLE IN MANHATTAN & BROOKLYN',
  image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
};

const UserDetailsScreen = ({ route, navigation }) => {
  const { theme } = useContext(Context);
  const c = theme.colors;
  const passedUser = route?.params?.user || {};
  const user = { ...DEFAULT_USER, ...passedUser };

  const openWhatsApp = () => {
    const text = encodeURIComponent(DEFAULT_MESSAGE);
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`);
  };

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
            {user.image ? (
              <Image source={{ uri: user.image }} style={styles.avatar} resizeMode="cover" />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: c.surfaceSecondary }]}>
                <Icon name="person" size={64} color={c.accent} />
              </View>
            )}
            <View style={[styles.settingsBadge, { backgroundColor: c.surface }]}>
              <Icon name="settings" size={18} color={c.accent} />
            </View>
          </View>
          <Text style={[styles.name, { color: c.text }]}>{user.name}</Text>
          <Text style={[styles.profession, { color: c.accent }]}>{user.profession}</Text>
          <View style={styles.locationRow}>
            <Icon name="location-on" size={16} color={c.text} />
            <Text style={[styles.location, { color: c.text }]}>{user.location}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: c.surface }]}>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>EXPERIENCE</Text>
              <Text style={[styles.statValue, { color: c.text }]}>{user.experience || '15 Yrs'}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: c.surface }]}>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>RATING</Text>
              <View style={styles.ratingRow}>
                <Icon name="star" size={16} color={c.accent} />
                <Text style={[styles.statValue, { color: c.text }]}>{user.rating || '4.9'}</Text>
              </View>
            </View>
            <View style={[styles.statCard, { backgroundColor: c.surface }]}>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>PROJECTS</Text>
              <Text style={[styles.statValue, { color: c.text }]}>{user.projects || '120+'}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.contactCard, { backgroundColor: c.surface }]}>
          <View style={styles.blurredRow}>
            <Text style={[styles.blurredText, { color: c.textSecondary }]}>••••••••••••••••••</Text>
            <Icon name="lock" size={18} color={c.textSecondary} />
          </View>
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: c.accent }]}
            onPress={() => {}}
            activeOpacity={0.85}
          >
            <Text style={[styles.loginBtnText, { color: c.accentText }]}>LOGIN TO VIEW CONTACT</Text>
            <Icon name="arrow-forward" size={18} color={c.accentText} />
          </TouchableOpacity>
          <Text style={[styles.premiumLabel, { color: c.textSecondary }]}>PREMIUM MEMBERS ONLY</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: c.accent }]}>SERVICE PHILOSOPHY</Text>
        <Text style={[styles.sectionText, { color: c.text }]}>{user.servicePhilosophy}</Text>

        <Text style={[styles.sectionTitle, { color: c.accent }]}>SERVICE AREA</Text>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800' }}
          style={[styles.mapArea, { backgroundColor: c.surface }]}
          imageStyle={styles.mapImage}
        >
          <View style={styles.mapOverlay}>
            <View style={[styles.mapDot, { backgroundColor: c.accent }]} />
            <Text style={[styles.mapText, { color: c.text }]}>{user.serviceArea}</Text>
          </View>
        </ImageBackground>

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
