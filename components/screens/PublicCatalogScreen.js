import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
  Modal,
  Linking,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Context from '../../context/Context';
import { getPublicCatalogsByTenant, getPublicCatalog } from '../../service/catalogService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// ─── pinch distance helper ──────────────────────────────────────────────────
const touchDistance = (touches) => {
  const dx = touches[0].pageX - touches[1].pageX;
  const dy = touches[0].pageY - touches[1].pageY;
  return Math.sqrt(dx * dx + dy * dy);
};

// ─── Full-screen zoomable image viewer ─────────────────────────────────────
const ImageViewer = ({ item, onClose, sellerPhone, tenantName, onOrder }) => {
  const insets = useSafeAreaInsets();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const txAnim = useRef(new Animated.Value(0)).current;
  const tyAnim = useRef(new Animated.Value(0)).current;

  const scaleRef = useRef(1);
  const txRef = useRef(0);
  const tyRef = useRef(0);
  const pinchStart = useRef(null);
  const panStart = useRef(null);
  const lastTap = useRef(0);

  // Reset zoom whenever a new image is viewed
  useEffect(() => {
    scaleAnim.setValue(1);
    txAnim.setValue(0);
    tyAnim.setValue(0);
    scaleRef.current = 1;
    txRef.current = 0;
    tyRef.current = 0;
  }, [item?._id]);

  const snapToIdentity = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      Animated.spring(txAnim, { toValue: 0, useNativeDriver: true }),
      Animated.spring(tyAnim, { toValue: 0, useNativeDriver: true }),
    ]).start(() => {
      scaleRef.current = 1;
      txRef.current = 0;
      tyRef.current = 0;
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 2 || Math.abs(gs.dy) > 2,

      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;

        // Double-tap to toggle zoom
        const now = Date.now();
        if (touches.length === 1) {
          if (now - lastTap.current < 280) {
            if (scaleRef.current > 1.2) {
              snapToIdentity();
            } else {
              const targetScale = 2.5;
              scaleRef.current = targetScale;
              Animated.spring(scaleAnim, { toValue: targetScale, useNativeDriver: true }).start();
            }
            lastTap.current = 0;
            return;
          }
          lastTap.current = now;
        }

        if (touches.length === 2) {
          pinchStart.current = {
            dist: touchDistance(touches),
            scale: scaleRef.current,
          };
        } else {
          panStart.current = {
            tx: txRef.current,
            ty: tyRef.current,
            x: touches[0].pageX,
            y: touches[0].pageY,
          };
        }
      },

      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;

        if (touches.length === 2 && pinchStart.current) {
          const newScale = Math.max(
            1,
            Math.min(5, pinchStart.current.scale * (touchDistance(touches) / pinchStart.current.dist))
          );
          scaleRef.current = newScale;
          scaleAnim.setValue(newScale);
          return;
        }

        if (touches.length === 1 && panStart.current && scaleRef.current > 1.05) {
          const dx = touches[0].pageX - panStart.current.x;
          const dy = touches[0].pageY - panStart.current.y;
          const newTx = panStart.current.tx + dx;
          const newTy = panStart.current.ty + dy;
          txRef.current = newTx;
          tyRef.current = newTy;
          txAnim.setValue(newTx);
          tyAnim.setValue(newTy);
        }
      },

      onPanResponderRelease: () => {
        pinchStart.current = null;
        panStart.current = null;
        if (scaleRef.current < 1.1) {
          snapToIdentity();
        }
      },

      onPanResponderTerminate: () => {
        pinchStart.current = null;
        panStart.current = null;
      },
    })
  ).current;

  if (!item) return null;

  return (
    <View style={viewerStyles.root}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />

      {/* Close */}
      <TouchableOpacity
        style={[viewerStyles.closeBtn, { top: insets.top + 10 }]}
        onPress={onClose}
        hitSlop={12}
      >
        <Icon name="close" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Zoom hint */}
      <Text style={[viewerStyles.zoomHint, { top: insets.top + 14 }]}>
        Pinch or double-tap to zoom
      </Text>

      {/* Zoomable image area */}
      <View style={viewerStyles.imageWrap} {...panResponder.panHandlers}>
        <Animated.Image
          source={{ uri: item.imageUrl }}
          style={[
            viewerStyles.image,
            {
              transform: [
                { scale: scaleAnim },
                { translateX: txAnim },
                { translateY: tyAnim },
              ],
            },
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Info footer */}
      <View style={[viewerStyles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {item.price != null && (
          <Text style={viewerStyles.price}>
            ₹{Number(item.price).toLocaleString('en-IN')}
          </Text>
        )}
        {item.title ? (
          <Text style={viewerStyles.title} numberOfLines={2}>
            {item.title}
          </Text>
        ) : null}
        {item.description ? (
          <Text style={viewerStyles.desc} numberOfLines={3}>
            {item.description}
          </Text>
        ) : null}

        {sellerPhone ? (
          <TouchableOpacity
            style={viewerStyles.orderBtn}
            onPress={() => onOrder(item)}
            activeOpacity={0.85}
          >
            <Icon name="chat" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={viewerStyles.orderBtnText}>Order via WhatsApp</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

// ─── Main screen ───────────────────────────────────────────────────────────
const PublicCatalogScreen = ({ route, navigation }) => {
  const { theme } = useContext(Context);
  const c = theme.colors;

  const tenantId = route?.params?.tenantId;
  const tenantType = route?.params?.tenantType;
  const tenantName = route?.params?.tenantName || 'Catalog';
  const sellerPhone = route?.params?.sellerPhone || '';

  const [catalogs, setCatalogs] = useState([]);
  const [activeCatalog, setActiveCatalog] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switchingImages, setSwitchingImages] = useState(false);
  const [viewerItem, setViewerItem] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const cats = await getPublicCatalogsByTenant(tenantId, tenantType);
        setCatalogs(cats);
        if (cats.length > 0) {
          setActiveCatalog(cats[0]);
          const detail = await getPublicCatalog(cats[0]._id);
          setImages(detail.images || []);
        }
      } catch (_) {
        setCatalogs([]);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
    if (tenantId) load();
  }, [tenantId, tenantType]);

  const switchCatalog = async (cat) => {
    if (activeCatalog?._id === cat._id) return;
    setActiveCatalog(cat);
    setSwitchingImages(true);
    try {
      const detail = await getPublicCatalog(cat._id);
      setImages(detail.images || []);
    } catch (_) {
      setImages([]);
    } finally {
      setSwitchingImages(false);
    }
  };

  const openWhatsApp = (item) => {
    const num = (sellerPhone || '').replace(/\D/g, '');
    if (!num) return;
    const parts = [`Hi, I am interested in ordering from *${tenantName}*`];
    if (item.title) parts.push(`\nItem: *${item.title}*`);
    if (item.price != null)
      parts.push(`Price: ₹${Number(item.price).toLocaleString('en-IN')}`);
    if (item.description) parts.push(`\n${item.description}`);
    parts.push('\nPlease confirm availability.');
    Linking.openURL(`https://wa.me/${num}?text=${encodeURIComponent(parts.join('\n'))}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerBtn}>
          <Icon name="arrow-back" size={24} color={c.accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1}>
          {activeCatalog?.title || tenantName}
        </Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      ) : catalogs.length === 0 ? (
        <View style={styles.centerWrap}>
          <Icon name="photo-library" size={52} color={c.textSecondary} style={{ marginBottom: 14 }} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>No Catalog Available</Text>
          <Text style={[styles.emptyHint, { color: c.textSecondary }]}>
            This seller has not added a product catalog yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={switchingImages ? [] : images}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          ListHeaderComponent={
            <>
              {catalogs.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tabsList}
                  style={styles.tabsWrap}
                >
                  {catalogs.map((cat) => (
                    <TouchableOpacity
                      key={cat._id}
                      style={[
                        styles.tab,
                        { borderColor: c.border },
                        activeCatalog?._id === cat._id && {
                          backgroundColor: c.accent,
                          borderColor: c.accent,
                        },
                      ]}
                      onPress={() => switchCatalog(cat)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          { color: activeCatalog?._id === cat._id ? c.accentText : c.text },
                        ]}
                      >
                        {cat.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {activeCatalog?.description ? (
                <Text style={[styles.catalogDesc, { color: c.textSecondary }]}>
                  {activeCatalog.description}
                </Text>
              ) : null}

              {switchingImages && (
                <View style={{ padding: 32, alignItems: 'center' }}>
                  <ActivityIndicator color={c.accent} />
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            !switchingImages ? (
              <View style={styles.emptyGrid}>
                <Icon name="photo-library" size={40} color={c.textSecondary} style={{ marginBottom: 10 }} />
                <Text style={[styles.emptyHint, { color: c.textSecondary }]}>
                  No items in this catalog yet.
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.imgCard, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={() => setViewerItem(item)}
              activeOpacity={0.85}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.imgThumb} resizeMode="cover" />
              <View style={styles.imgInfo}>
                {item.title ? (
                  <Text style={[styles.imgTitle, { color: c.text }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                ) : null}
                {item.price != null ? (
                  <Text style={[styles.imgPrice, { color: c.accent }]}>
                    ₹{Number(item.price).toLocaleString('en-IN')}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Full-screen viewer modal */}
      <Modal
        visible={!!viewerItem}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setViewerItem(null)}
        statusBarTranslucent
      >
        <ImageViewer
          item={viewerItem}
          onClose={() => setViewerItem(null)}
          sellerPhone={sellerPhone}
          tenantName={tenantName}
          onOrder={openWhatsApp}
        />
      </Modal>
    </SafeAreaView>
  );
};

// ─── Viewer styles ─────────────────────────────────────────────────────────
const viewerStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    padding: 7,
  },
  zoomHint: {
    position: 'absolute',
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    zIndex: 10,
  },
  imageWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.65,
  },
  footer: {
    backgroundColor: 'rgba(15,15,15,0.95)',
    paddingHorizontal: 20,
    paddingTop: 18,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  price: {
    color: '#FFD700',
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 6,
  },
  title: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 6,
  },
  desc: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 4,
  },
  orderBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

// ─── List styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { width: 40, alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', marginHorizontal: 8 },
  centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  emptyHint: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  tabsWrap: { marginBottom: 4 },
  tabsList: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  tabText: { fontSize: 13, fontWeight: '600' },
  catalogDesc: { paddingHorizontal: 12, paddingBottom: 8, fontSize: 13, lineHeight: 19 },
  grid: { padding: 12, paddingBottom: 40 },
  gridRow: { justifyContent: 'space-between', marginBottom: 12 },
  emptyGrid: { paddingVertical: 40, alignItems: 'center' },
  imgCard: { width: CARD_WIDTH, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  imgThumb: { width: '100%', height: CARD_WIDTH },
  imgInfo: { padding: 10 },
  imgTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4, lineHeight: 18 },
  imgPrice: { fontSize: 17, fontWeight: '700' },
});

export default PublicCatalogScreen;
