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
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import Context from '../../context/Context';
import {
  getCatalogImages,
  uploadCatalogImage,
  bulkUploadCatalogImages,
  deleteCatalogImage,
} from '../../service/catalogService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const QUALITY_OPTIONS = [
  {
    value: 'standard',
    label: 'Standard',
    icon: 'photo',
    hint: 'Auto-compressed · Smaller size · More images',
    color: '#2ecc71',
  },
  {
    value: 'hd',
    label: 'HD',
    icon: 'hd',
    hint: 'High detail · Larger size · Fewer images',
    color: '#3498db',
  },
];

const CatalogDetailScreen = ({ route, navigation }) => {
  const { theme } = useContext(Context);
  const c = theme.colors;
  const catalog = route?.params?.catalog;

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]); // array from image picker
  const [quality, setQuality] = useState('standard');
  const [metaList, setMetaList] = useState([]); // [{title,description,price}] per asset
  const [uploading, setUploading] = useState(false);

  const fetchImages = useCallback(async () => {
    if (!catalog?._id) return;
    setLoading(true);
    try {
      const data = await getCatalogImages(catalog._id);
      setImages(data);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, [catalog?._id]);

  useFocusEffect(
    useCallback(() => {
      fetchImages();
    }, [fetchImages])
  );

  // ─── Image picking ────────────────────────────────────────────────────────
  const openPicker = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 10,
      includeBase64: false,
    });
    if (result.didCancel || !result.assets?.length) return;
    setSelectedAssets(result.assets);
    setMetaList(result.assets.map(() => ({ title: '', description: '', price: '' })));
    setModalVisible(true);
  };

  // ─── Meta helpers ─────────────────────────────────────────────────────────
  const updateMeta = (index, field, value) => {
    setMetaList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeSelected = (index) => {
    setSelectedAssets((prev) => prev.filter((_, i) => i !== index));
    setMetaList((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Upload ───────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!selectedAssets.length) return;

    // Validate prices
    for (let i = 0; i < selectedAssets.length; i++) {
      const p = metaList[i]?.price;
      if (p && (isNaN(Number(p)) || Number(p) < 0)) {
        Alert.alert('Invalid Price', `Image ${i + 1}: price must be a non-negative number.`);
        return;
      }
    }

    setUploading(true);
    try {
      if (selectedAssets.length === 1) {
        // Single: pass quality + metadata
        const asset = selectedAssets[0];
        const meta = metaList[0] || {};
        const formData = new FormData();
        formData.append('image', {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'catalog_image.jpg',
        });
        formData.append('quality', quality);
        if (meta.title?.trim())       formData.append('title', meta.title.trim());
        if (meta.description?.trim()) formData.append('description', meta.description.trim());
        if (meta.price?.trim())       formData.append('price', meta.price.trim());
        await uploadCatalogImage(catalog._id, formData);
      } else {
        // Bulk
        await bulkUploadCatalogImages(catalog._id, selectedAssets, quality, metaList);
      }

      setModalVisible(false);
      setSelectedAssets([]);
      setMetaList([]);
      fetchImages();
    } catch (e) {
      Alert.alert('Upload Failed', e.message);
    } finally {
      setUploading(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = (image) => {
    Alert.alert('Delete Item', 'Remove this image from the catalog?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCatalogImage(catalog._id, image._id);
            setImages((prev) => prev.filter((img) => img._id !== image._id));
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerBtn}>
          <Icon name="arrow-back" size={24} color={c.accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1}>
          {catalog?.title}
        </Text>
        <TouchableOpacity onPress={openPicker} hitSlop={12} style={styles.headerBtn}>
          <Icon name="add-photo-alternate" size={26} color={c.accent} />
        </TouchableOpacity>
      </View>

      {catalog?.description ? (
        <Text style={[styles.catalogDesc, { color: c.textSecondary, backgroundColor: c.surface }]}>
          {catalog.description}
        </Text>
      ) : null}

      {/* Image grid */}
      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      ) : images.length === 0 ? (
        <View style={styles.centerWrap}>
          <Icon name="add-photo-alternate" size={52} color={c.textSecondary} style={{ marginBottom: 14 }} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>No Items Yet</Text>
          <Text style={[styles.emptyHint, { color: c.textSecondary }]}>
            Tap the camera icon to add items. You can pick multiple images at once.
          </Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: c.accent }]}
            onPress={openPicker}
            activeOpacity={0.85}
          >
            <Icon name="add-photo-alternate" size={20} color={c.accentText} style={{ marginRight: 6 }} />
            <Text style={[styles.addBtnText, { color: c.accentText }]}>Add Images</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <View style={[styles.imgCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Image source={{ uri: item.imageUrl }} style={styles.imgThumb} resizeMode="cover" />
              {/* Quality badge */}
              {item.quality === 'hd' && (
                <View style={styles.hdBadge}>
                  <Text style={styles.hdBadgeText}>HD</Text>
                </View>
              )}
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)} hitSlop={8}>
                <Icon name="delete" size={15} color="#fff" />
              </TouchableOpacity>
              <View style={styles.imgInfo}>
                {item.title ? (
                  <Text style={[styles.imgTitle, { color: c.text }]} numberOfLines={1}>{item.title}</Text>
                ) : null}
                {item.price != null ? (
                  <Text style={[styles.imgPrice, { color: c.accent }]}>
                    ₹{Number(item.price).toLocaleString('en-IN')}
                  </Text>
                ) : (
                  <Text style={[styles.noPrice, { color: c.textSecondary }]}>No price</Text>
                )}
                {item.description ? (
                  <Text style={[styles.imgDesc, { color: c.textSecondary }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                <Text style={[styles.imgSize, { color: c.textSecondary }]}>
                  {item.sizeMb.toFixed(2)} MB
                  {item.originalSizeMb && item.originalSizeMb > item.sizeMb
                    ? ` (was ${item.originalSizeMb.toFixed(2)} MB)`
                    : ''}
                </Text>
              </View>
            </View>
          )}
        />
      )}

      {/* ─── Upload Modal ─────────────────────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text }]}>
                Add {selectedAssets.length > 1 ? `${selectedAssets.length} Images` : 'Image'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={12}>
                <Icon name="close" size={24} color={c.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Quality selector */}
            <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Storage Quality</Text>
            <View style={styles.qualityRow}>
              {QUALITY_OPTIONS.map((opt) => {
                const active = quality === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.qualityCard,
                      { borderColor: active ? opt.color : c.border, backgroundColor: c.background },
                      active && { borderWidth: 2 },
                    ]}
                    onPress={() => setQuality(opt.value)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.qualityCardTop}>
                      <Icon name={opt.icon} size={22} color={active ? opt.color : c.textSecondary} />
                      <Text style={[styles.qualityLabel, { color: active ? opt.color : c.text }]}>
                        {opt.label}
                      </Text>
                      {active && (
                        <Icon name="check-circle" size={18} color={opt.color} style={{ marginLeft: 'auto' }} />
                      )}
                    </View>
                    <Text style={[styles.qualityHint, { color: c.textSecondary }]}>{opt.hint}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Per-image metadata */}
            <ScrollView
              style={styles.metaScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {selectedAssets.map((asset, i) => (
                <View
                  key={asset.uri + i}
                  style={[styles.assetRow, { borderColor: c.border }]}
                >
                  <View style={styles.assetPreviewWrap}>
                    <Image source={{ uri: asset.uri }} style={styles.assetThumb} resizeMode="cover" />
                    {selectedAssets.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeAssetBtn}
                        onPress={() => removeSelected(i)}
                        hitSlop={8}
                      >
                        <Icon name="close" size={14} color="#fff" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.assetMeta}>
                    <TextInput
                      style={[styles.metaInput, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
                      placeholder={`Price ₹ (image ${i + 1})`}
                      placeholderTextColor={c.textSecondary}
                      value={metaList[i]?.price || ''}
                      onChangeText={(v) => updateMeta(i, 'price', v)}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.metaInput, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
                      placeholder="Item name (optional)"
                      placeholderTextColor={c.textSecondary}
                      value={metaList[i]?.title || ''}
                      onChangeText={(v) => updateMeta(i, 'title', v)}
                      maxLength={80}
                    />
                    <TextInput
                      style={[styles.metaInput, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
                      placeholder="Description (optional)"
                      placeholderTextColor={c.textSecondary}
                      value={metaList[i]?.description || ''}
                      onChangeText={(v) => updateMeta(i, 'description', v)}
                      maxLength={200}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: c.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: c.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: c.accent }]}
                onPress={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={c.accentText} />
                ) : (
                  <Text style={[styles.modalBtnText, { color: c.accentText }]}>
                    Upload {selectedAssets.length > 1 ? `(${selectedAssets.length})` : ''}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  headerTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', marginHorizontal: 8 },
  catalogDesc: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    lineHeight: 19,
  },
  centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyHint: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addBtnText: { fontSize: 15, fontWeight: '700' },
  grid: { padding: 12, paddingBottom: 40 },
  gridRow: { justifyContent: 'space-between', marginBottom: 12 },
  imgCard: { width: CARD_WIDTH, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  imgThumb: { width: '100%', height: CARD_WIDTH },
  hdBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#3498db',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hdBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(231,76,60,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgInfo: { padding: 8 },
  imgTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  imgPrice: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  noPrice: { fontSize: 12, fontStyle: 'italic', marginBottom: 2 },
  imgDesc: { fontSize: 11, lineHeight: 15, marginTop: 2, marginBottom: 2 },
  imgSize: { fontSize: 10 },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 },
  qualityRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  qualityCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  qualityCardTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  qualityLabel: { fontSize: 14, fontWeight: '700' },
  qualityHint: { fontSize: 11, lineHeight: 15 },
  metaScroll: { maxHeight: 320 },
  assetRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  assetPreviewWrap: { position: 'relative' },
  assetThumb: { width: 72, height: 72, borderRadius: 8 },
  removeAssetBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(231,76,60,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetMeta: { flex: 1, gap: 6 },
  metaInput: {
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: { fontSize: 15, fontWeight: '700' },
});

export default CatalogDetailScreen;
