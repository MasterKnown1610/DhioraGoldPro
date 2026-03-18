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
  Share,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Context from '../../context/Context';
import { getPublicCatalogsByTenant, getPublicCatalog } from '../../service/catalogService';

const DEFAULT_MESSAGE = 'Hi, I would like to connect regarding your services.';

const UserDetailsScreen = ({ route, navigation }) => {
  const { theme, users } = useContext(Context);
  const c = theme.colors;
  const passedUser = route?.params?.user || {};
  const userId = route?.params?.userId;
  const needsFetch = !!userId && !passedUser?.userName;
  const [loading, setLoading] = useState(needsFetch);
  const [catalogPreviewLoading, setCatalogPreviewLoading] = useState(false);
  const [catalogPreviewImages, setCatalogPreviewImages] = useState([]);

  const user = passedUser?.userName ? passedUser : (users.singleUser || passedUser);

  useEffect(() => {
    if (needsFetch && userId) {
      users.getUserById(userId).finally(() => setLoading(false));
    }
  }, [userId, needsFetch]);

  const phone = user?.phoneNumber;
  const sellerPhoneDigits = (phone || '').replace(/\D/g, '');

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

  const handleShare = async () => {
    if (!user?._id) return;
    const url = `https://dhiora-gold-backend.vercel.app/share/user/${user._id}`;
    try {
      await Share.share({
        message: `Check out ${displayName} on Dhiora Gold!\n${url}`,
        url,
      });
    } catch (_) {}
  };

  const openCatalog = () => {
    if (!user?._id) return;
    navigation.navigate('Public Catalog', {
      tenantId: user._id,
      tenantType: 'SERVICE_PROVIDER',
      tenantName: displayName,
      sellerPhone: sellerPhoneDigits,
    });
  };

  useEffect(() => {
    let cancelled = false;

    const loadCatalogPreview = async () => {
      if (!user?._id) return;
      setCatalogPreviewLoading(true);
      try {
        const cats = await getPublicCatalogsByTenant(user._id, 'SERVICE_PROVIDER');
        if (!cats?.length) {
          if (!cancelled) setCatalogPreviewImages([]);
          return;
        }
        const detail = await getPublicCatalog(cats[0]._id);
        const imgs = (detail?.images || []).slice(0, 5);
        if (!cancelled) setCatalogPreviewImages(imgs);
      } catch (_) {
        if (!cancelled) setCatalogPreviewImages([]);
      } finally {
        if (!cancelled) setCatalogPreviewLoading(false);
      }
    };

    loadCatalogPreview();
    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
            <Icon name="arrow-back" size={24} color={c.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn} hitSlop={12}>
            <Icon name="share" size={24} color={c.accent} />
          </TouchableOpacity>
        </View>

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

        {/* Catalog preview (top) */}
        {user?._id ? (
          <View style={styles.catalogPreviewWrap}>
            <View style={styles.catalogPreviewHeader}>
              <Text style={[styles.catalogPreviewTitle, { color: c.text }]}>Catalog</Text>
              <TouchableOpacity onPress={openCatalog} activeOpacity={0.8} hitSlop={10} style={styles.viewMoreBtn}>
                <Text style={[styles.viewMoreText, { color: c.accent }]}>View more</Text>
                <Icon name="chevron-right" size={18} color={c.accent} />
              </TouchableOpacity>
            </View>

            {catalogPreviewLoading ? (
              <View style={styles.catalogPreviewLoading}>
                <ActivityIndicator size="small" color={c.accent} />
              </View>
            ) : catalogPreviewImages.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catalogPreviewList}>
                {catalogPreviewImages.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    activeOpacity={0.85}
                    onPress={openCatalog}
                    style={[styles.previewCard, { borderColor: c.border }]}
                  >
                    <Image source={{ uri: item.imageUrl }} style={styles.previewImage} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={[styles.catalogPreviewEmpty, { color: c.textSecondary }]}>No catalog available yet.</Text>
            )}
          </View>
        ) : null}

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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtn: {
    padding: 4,
    zIndex: 10,
  },
  shareBtn: {
    padding: 4,
    zIndex: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  catalogPreviewWrap: {
    marginBottom: 22,
  },
  catalogPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  catalogPreviewTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  viewMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '800',
    marginRight: 2,
  },
  catalogPreviewLoading: {
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogPreviewEmpty: {
    fontSize: 13,
  },
  catalogPreviewList: {
    paddingRight: 12,
  },
  previewCard: {
    width: 110,
    height: 96,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    marginRight: 12,
  },
  previewImage: {
    width: '100%',
    height: '100%',
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
    marginBottom: 12,
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
