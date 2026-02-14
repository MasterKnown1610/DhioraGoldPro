import React, { useContext, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Linking,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Context from '../../context/Context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CAROUSEL_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const CAROUSEL_HEIGHT = 200;

const PLACEHOLDER_IMAGES = ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'];

const ShopDetailsScreen = ({ route, navigation }) => {
  const { theme, shops } = useContext(Context);
  const c = theme.colors;
  const passedShop = route?.params?.shop || {};
  const shopId = route?.params?.shopId;
  const needsFetch = !!shopId && !passedShop?.shopName;
  const [loading, setLoading] = useState(needsFetch);

  const shop = passedShop?.shopName ? passedShop : (shops.singleShop || passedShop);
  const images = shop?.images?.length
    ? shop.images
    : shop?.image
      ? [shop.image]
      : PLACEHOLDER_IMAGES;

  useEffect(() => {
    if (needsFetch && shopId) {
      shops.getShopById(shopId).finally(() => setLoading(false));
    }
  }, [shopId, needsFetch]);

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const onMomentumScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (CAROUSEL_WIDTH + 12));
    setActiveIndex(Math.min(index, images.length - 1));
  };

  const phone = shop?.phoneNumber || shop?.phone;
  const whatsapp = shop?.whatsappNumber || phone;

  const handleCall = () => {
    const num = (phone || '').replace(/\D/g, '');
    if (num) Linking.openURL(`tel:${num}`);
  };

  const handleWhatsApp = () => {
    const num = (whatsapp || phone || '').replace(/\D/g, '');
    if (num) Linking.openURL(`https://wa.me/${num}`);
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

  const displayName = shop?.shopName || shop?.name;
  const displayAddress = shop?.address;
  const about = shop?.about || `${displayName} - Gold & jewelry shop. Visit us at ${displayAddress || ''}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={12}>
          <Icon name="arrow-back" size={24} color={c.accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>Shop Details</Text>
        <TouchableOpacity style={styles.headerBtn} hitSlop={12}>
          <Icon name="share" size={24} color={c.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.carouselWrapper}>
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            keyExtractor={(_, i) => String(i)}
            showsHorizontalScrollIndicator={false}
            snapToInterval={CAROUSEL_WIDTH + 12}
            snapToAlignment="start"
            decelerationRate="fast"
            onMomentumScrollEnd={onMomentumScrollEnd}
            contentContainerStyle={styles.carouselContent}
            renderItem={({ item }) => (
              <Image
                source={{ uri: typeof item === 'string' ? item : item?.uri }}
                style={styles.carouselImage}
                resizeMode="cover"
              />
            )}
          />
          <View style={styles.pagination}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === activeIndex
                    ? [styles.dotActive, { backgroundColor: c.accent }]
                    : { backgroundColor: c.textSecondary, opacity: 0.6 },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.tagsRow}>
          {shop?.state && (
            <View style={[styles.tag, { backgroundColor: c.accent }]}>
              <Text style={[styles.tagText, { color: c.accentText }]}>{shop.state}</Text>
            </View>
          )}
          {shop?.district && (
            <View style={[styles.tag, { backgroundColor: c.accent }]}>
              <Text style={[styles.tagText, { color: c.accentText }]}>{shop.district}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.shopName, { color: c.text }]}>{displayName}</Text>
        {displayAddress ? (
          <View style={styles.addressRow}>
            <Icon name="location-on" size={18} color={c.accent} style={styles.pinIcon} />
            <Text style={[styles.address, { color: c.text }]}>{displayAddress}</Text>
          </View>
        ) : null}

        {(phone || whatsapp) ? (
          <View style={[styles.contactCard, { backgroundColor: c.surface }]}>
            <View style={[styles.phoneIconCircle, { backgroundColor: c.accent }]}>
              <Icon name="phone" size={32} color={c.accentText} />
            </View>
            <Text style={[styles.phoneNumber, { color: c.text }]}>{phone || whatsapp}</Text>
            <Text style={[styles.phoneDesc, { color: c.textSecondary }]}>
              Official contact for {displayName}. Available for calls and inquiries.
            </Text>
          </View>
        ) : null}

        <Text style={[styles.aboutTitle, { color: c.accent }]}>ABOUT THE SHOP</Text>
        <Text style={[styles.aboutText, { color: c.text }]}>{about}</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: c.accent }]}
            onPress={handleCall}
            activeOpacity={0.85}
          >
            <Icon name="phone" size={22} color={c.accentText} style={styles.actionIcon} />
            <Text style={[styles.actionText, { color: c.accentText }]}>Call Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: c.accent }]}
            onPress={handleWhatsApp}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="whatsapp"
              size={24}
              color={c.accentText}
              style={styles.actionIcon}
            />
            <Text style={[styles.actionText, { color: c.accentText }]}>WhatsApp</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  carouselWrapper: {
    marginBottom: 16,
  },
  carouselContent: {
    paddingRight: 12,
  },
  carouselImage: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    marginRight: 12,
    borderRadius: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  shopName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  pinIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  address: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  contactCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  phoneIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  phoneNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  phoneDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  aboutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 28,
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
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ShopDetailsScreen;
