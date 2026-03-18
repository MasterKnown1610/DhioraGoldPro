import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Context from '../../context/Context';
import { getMyCatalogs, createCatalog, getCatalogSubscriptionStatus } from '../../service/catalogService';
import { createOrder, verifyPayment, openRazorpayCheckout } from '../../service/paymentService';

const CATALOG_BASIC_PRICE_DISPLAY = '₹100 / month';
const CATALOG_PRO_PRICE_DISPLAY = '₹299 / month';

const MyCatalogsScreen = ({ navigation }) => {
  const { theme, auth } = useContext(Context);
  const c = theme.colors;

  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogEnabled, setCatalogEnabled] = useState(false);
  const [catalogPlan, setCatalogPlan] = useState('BASIC');
  const [catalogExpiresAt, setCatalogExpiresAt] = useState(null);
  const [storageUsedMb, setStorageUsedMb] = useState(0);
  const [storageLimitMb, setStorageLimitMb] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [imagesLimit, setImagesLimit] = useState(0);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [activating, setActivating] = useState(false);

  const fetchData = useCallback(async () => {
    if (!auth.token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [status, data] = await Promise.all([
        getCatalogSubscriptionStatus(),
        getMyCatalogs(),
      ]);
      setCatalogEnabled(status.catalogEnabled);
      setCatalogPlan(status.catalogPlan || 'BASIC');
      setCatalogExpiresAt(status.catalogSubscriptionEndDate || null);
      setStorageUsedMb(status.storageUsedMb || 0);
      setStorageLimitMb(status.storageLimitMb || 0);
      setTotalImages(status.totalImages || 0);
      setImagesLimit(status.imagesLimit || 0);
      setCatalogs(data);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleActivateCatalog = async (plan) => {
    setActivating(true);
    try {
      const chosenPlan = plan === 'PRO' ? 'PRO' : 'BASIC';
      const order = await createOrder('catalog_subscription', { catalogPlan: chosenPlan });
      const result = await openRazorpayCheckout({
        key_id: order.key_id,
        razorpayOrderId: order.razorpayOrderId,
        amount: order.amount,
        description: `Catalog Subscription (${chosenPlan})`,
        name: 'Dhiora Gold',
      });
      await verifyPayment({
        razorpay_order_id: result.razorpay_order_id,
        razorpay_payment_id: result.razorpay_payment_id,
        razorpay_signature: result.razorpay_signature,
        type: 'catalog_subscription',
        orderId: order.orderId,
      });
      Alert.alert('Success', 'Catalog activated! Your plan is active for 30 days.');
      fetchData();
    } catch (e) {
      if (e.message !== 'Payment cancelled') {
        Alert.alert('Error', e.message);
      }
    } finally {
      setActivating(false);
    }
  };

  const openCreate = () => {
    setNewTitle('');
    setNewDesc('');
    setCreateModalVisible(true);
  };

  const handleCreate = async () => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      Alert.alert('Required', 'Please enter a catalog title.');
      return;
    }
    setCreating(true);
    try {
      await createCatalog({ title: trimmedTitle, description: newDesc.trim() || undefined });
      setCreateModalVisible(false);
      fetchData();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setCreating(false);
    }
  };

  if (!auth.token) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerBtn}>
            <Icon name="arrow-back" size={24} color={c.accent} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: c.text }]}>My Catalogs</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={styles.centerWrap}>
          <Icon name="photo-library" size={52} color={c.textSecondary} style={{ marginBottom: 14 }} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>Login Required</Text>
          <Text style={[styles.emptyHint, { color: c.textSecondary }]}>
            Please login to manage your catalogs.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerBtn}>
          <Icon name="arrow-back" size={24} color={c.accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>My Catalogs</Text>
        {catalogEnabled ? (
          <TouchableOpacity onPress={openCreate} hitSlop={12} style={styles.headerBtn}>
            <Icon name="add" size={28} color={c.accent} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBtn} />
        )}
      </View>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      ) : !catalogEnabled ? (
        /* ── Subscription gate ── */
        <View style={styles.centerWrap}>
          <View style={[styles.subscribeCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Icon name="photo-library" size={44} color={c.accent} style={{ marginBottom: 12 }} />
            <Text style={[styles.subscribeTitle, { color: c.text }]}>Unlock Product Catalog</Text>
            <Text style={[styles.subscribeDesc, { color: c.textSecondary }]}>
              Showcase your products with images, prices and descriptions. Customers can browse and order directly via WhatsApp.
            </Text>
            <View style={styles.planRow}>
              <TouchableOpacity
                style={[styles.planCard, { borderColor: c.border, backgroundColor: c.background }]}
                onPress={() => handleActivateCatalog('BASIC')}
                disabled={activating}
                activeOpacity={0.85}
              >
                <Text style={[styles.planTitle, { color: c.text }]}>Basic</Text>
                <Text style={[styles.planPrice, { color: c.accent }]}>{CATALOG_BASIC_PRICE_DISPLAY}</Text>
                <Text style={[styles.planHint, { color: c.textSecondary }]}>500MB • 300 images</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.planCard, { borderColor: c.border, backgroundColor: c.background }]}
                onPress={() => handleActivateCatalog('PRO')}
                disabled={activating}
                activeOpacity={0.85}
              >
                <Text style={[styles.planTitle, { color: c.text }]}>Pro</Text>
                <Text style={[styles.planPrice, { color: c.accent }]}>{CATALOG_PRO_PRICE_DISPLAY}</Text>
                <Text style={[styles.planHint, { color: c.textSecondary }]}>2GB • 1500 images</Text>
              </TouchableOpacity>
            </View>
            {activating ? <ActivityIndicator size="small" color={c.accent} style={{ marginTop: 14 }} /> : null}
          </View>
        </View>
      ) : catalogs.length === 0 ? (
        <View style={styles.centerWrap}>
          <Icon name="photo-library" size={52} color={c.textSecondary} style={{ marginBottom: 14 }} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>No Catalogs Yet</Text>
          <Text style={[styles.emptyHint, { color: c.textSecondary }]}>
            Tap + to create your first product catalog.
          </Text>
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: c.accent }]}
            onPress={openCreate}
            activeOpacity={0.85}
          >
            <Icon name="add" size={20} color={c.accentText} style={{ marginRight: 6 }} />
            <Text style={[styles.createBtnText, { color: c.accentText }]}>Create Catalog</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={catalogs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={[styles.usageCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={styles.usageRow}>
                <Text style={[styles.usageTitle, { color: c.text }]}>Catalog Plan</Text>
                <Text style={[styles.usageValue, { color: c.accent }]}>{catalogPlan}</Text>
              </View>
              {catalogExpiresAt ? (
                <Text style={[styles.usageSub, { color: c.textSecondary }]}>
                  Expires on {new Date(catalogExpiresAt).toLocaleDateString()}
                </Text>
              ) : null}
              <Text style={[styles.usageSub, { color: c.textSecondary }]}>
                Storage used: {Number(storageUsedMb).toFixed(2)}MB / {storageLimitMb || 0}MB
              </Text>
              <Text style={[styles.usageSub, { color: c.textSecondary }]}>
                Images used: {totalImages || 0} / {imagesLimit || 0}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={() => navigation.navigate('Catalog Detail', { catalog: item })}
              activeOpacity={0.8}
            >
              <View style={[styles.cardIcon, { backgroundColor: c.accent + '20' }]}>
                <Icon name="photo-library" size={28} color={c.accent} />
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: c.text }]}>{item.title}</Text>
                {item.description ? (
                  <Text style={[styles.cardDesc, { color: c.textSecondary }]} numberOfLines={1}>
                    {item.description}
                  </Text>
                ) : null}
                <Text style={[styles.cardMeta, { color: c.textSecondary }]}>
                  {item.tenantType === 'SHOP' ? 'Shop Catalog' : 'Service Provider Catalog'}
                </Text>
              </View>
              <Icon name="chevron-right" size={22} color={c.textSecondary} />
            </TouchableOpacity>
          )}
        />
      )}

      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCreateModalVisible(false)}
        >
          <View
            style={[styles.modalCard, { backgroundColor: c.surface, borderColor: c.border }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.modalTitle, { color: c.text }]}>New Catalog</Text>

            <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
              placeholder="e.g. Gold Bangles Collection"
              placeholderTextColor={c.textSecondary}
              value={newTitle}
              onChangeText={setNewTitle}
              maxLength={80}
            />

            <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
              placeholder="Describe your catalog..."
              placeholderTextColor={c.textSecondary}
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
              numberOfLines={3}
              maxLength={200}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: c.border }]}
                onPress={() => setCreateModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: c.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: c.accent }]}
                onPress={handleCreate}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color={c.accentText} />
                ) : (
                  <Text style={[styles.modalBtnText, { color: c.accentText }]}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

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
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  subscribeCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  subscribeTitle: { fontSize: 20, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  subscribeDesc: { fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 20 },
  planRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  planCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  planTitle: { fontSize: 16, fontWeight: '900', marginBottom: 6 },
  planPrice: { fontSize: 16, fontWeight: '900', marginBottom: 6 },
  planHint: { fontSize: 12, fontWeight: '600' },
  usageCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  usageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  usageTitle: { fontSize: 14, fontWeight: '900' },
  usageValue: { fontSize: 14, fontWeight: '900' },
  usageSub: { fontSize: 12, marginTop: 6 },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  emptyHint: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  createBtnText: { fontSize: 15, fontWeight: '700' },
  listContent: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  cardDesc: { fontSize: 13, marginBottom: 3 },
  cardMeta: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 18 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 14,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: { fontSize: 15, fontWeight: '700' },
});

export default MyCatalogsScreen;
