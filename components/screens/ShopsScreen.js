import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Context from '../../context/Context';
import FilterModal from '../FilterModal';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600';

const ShopCard = ({ item, colors, onViewDetails }) => {
  const c = colors;
  const image = item.images?.[0] || item.image || PLACEHOLDER_IMAGE;

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: image }} style={styles.cardImage} resizeMode="cover" />
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.cardHeader}>
          <Text style={[styles.shopName, { color: c.text }]} numberOfLines={1}>
            {item.shopName || item.name}
          </Text>
        </View>
        <View style={styles.locationRow}>
          <Icon name="location-on" size={14} color={c.textSecondary} style={styles.pinIcon} />
          <Text style={[styles.address, { color: c.textSecondary }]} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
        {(item.state || item.district) && (
          <Text style={[styles.locationMeta, { color: c.textSecondary }]}>
            {[item.district, item.state].filter(Boolean).join(', ')}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.viewDetailsBtn, { backgroundColor: c.accent }]}
          onPress={() => onViewDetails?.(item)}
          activeOpacity={0.85}
        >
          <Text style={[styles.viewDetailsText, { color: c.accentText }]}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ShopsScreen = ({ navigation, route }) => {
  const { theme, shops } = useContext(Context);
  const c = theme.colors;
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ state: '', district: '', pincode: '' });
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const searchInputRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.focusSearch) {
        const t = setTimeout(() => {
          searchInputRef.current?.focus();
          navigation.setParams({ focusSearch: undefined });
        }, 100);
        return () => clearTimeout(t);
      }
    }, [route.params?.focusSearch, navigation])
  );

  const buildParams = useCallback((q, f) => {
    const params = {};
    if (q.trim()) params.search = q.trim();
    if (f?.state) params.state = f.state;
    if (f?.district) params.district = f.district;
    if (f?.pincode) params.pincode = f.pincode;
    return params;
  }, []);

  const loadShops = useCallback(
    async (filterOverride) => {
      const f = filterOverride !== undefined ? filterOverride : filters;
      const params = buildParams(searchQuery, f);
      await shops.getShops(params);
    },
    [searchQuery, filters, buildParams, shops]
  );

  useEffect(() => {
    const t = setTimeout(() => loadShops(), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleApplyFilters = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      loadShops(newFilters);
    },
    [loadShops]
  );

  const hasActiveFilters = !!(filters.state || filters.district || filters.pincode);
  const shopList = shops.shops || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: c.surface }]}>
          <Icon name="search" size={22} color={c.textSecondary} style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: c.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search luxury boutiques..."
            placeholderTextColor={c.textSecondary}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity
          style={[styles.filterIconBtn, { backgroundColor: c.surface }, hasActiveFilters && styles.filterBtnActive]}
          onPress={() => setFilterModalOpen(true)}
          activeOpacity={0.8}
        >
          <Icon name="filter-list" size={24} color={hasActiveFilters ? c.accent : c.text} />
        </TouchableOpacity>
      </View>

      <FilterModal
        visible={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        initialFilters={filters}
        onApply={handleApplyFilters}
        colors={c}
      />

      <Text style={[styles.sectionTitle, { color: c.accent }]}>EXCLUSIVE COLLECTIONS</Text>

      {shops.loading && shopList.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      ) : shopList.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Icon name="storefront" size={48} color={c.textSecondary} />
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>No shops found</Text>
        </View>
      ) : (
        <FlatList
          data={shopList}
          keyExtractor={(item) => item._id || item.id}
          renderItem={({ item }) => (
            <ShopCard
              item={item}
              colors={c}
              onViewDetails={(shop) => navigation?.navigate('Shop Details', { shop })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={shops.loading} onRefresh={loadShops} colors={[c.accent]} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  filterIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    borderWidth: 1,
    borderColor: 'rgba(248, 194, 77, 0.5)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 16,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageWrapper: {
    height: 180,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  premiumTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#F8C24D',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cardDetails: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  pinIcon: {
    marginRight: 4,
  },
  address: {
    fontSize: 14,
    flex: 1,
  },
  locationMeta: {
    fontSize: 12,
    marginBottom: 12,
  },
  viewDetailsBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ShopsScreen;
