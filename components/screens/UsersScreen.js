import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Context from '../../context/Context';
import FilterModal from '../FilterModal';

const UserCard = ({ item, colors, onViewProfile }) => {
  const c = colors;
  const image = item.profileImage || item.image;
  const name = item.userName || item.name;
  const profession = item.serviceProvided || item.profession;
  const location = [item.address, item.district, item.state].filter(Boolean).join(', ') || item.location;

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <View style={styles.cardInner}>
        <View style={styles.profileRow}>
          <View style={styles.imageWrapper}>
            {image ? (
              <Image source={{ uri: image }} style={styles.avatar} resizeMode="cover" />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: c.surfaceSecondary }]}>
                <Icon name="person" size={40} color={c.accent} />
              </View>
            )}
          </View>
          <View style={styles.infoBlock}>
            <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
              {name}
            </Text>
            <Text style={[styles.profession, { color: c.accent }]} numberOfLines={1}>
              {profession}
            </Text>
          </View>
        </View>

        {location ? (
          <View style={styles.locationRow}>
            <Icon name="location-on" size={14} color={c.textSecondary} />
            <Text style={[styles.location, { color: c.textSecondary }]} numberOfLines={1}>
              {location}
            </Text>
          </View>
        ) : null}

        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={styles.viewProfileBtn}
            onPress={() => onViewProfile?.(item)}
            activeOpacity={0.7}
          >
            <Text style={[styles.viewProfileText, { color: c.accent }]}>View Profile</Text>
            <Icon name="arrow-forward" size={18} color={c.accent} style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const UsersScreen = ({ navigation }) => {
  const { theme, users } = useContext(Context);
  const c = theme.colors;
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ state: '', district: '', pincode: '' });
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const buildParams = useCallback((q, f) => {
    const params = {};
    if (q.trim()) params.search = q.trim();
    if (f?.state) params.state = f.state;
    if (f?.district) params.district = f.district;
    if (f?.pincode) params.pincode = f.pincode;
    return params;
  }, []);

  const loadUsers = useCallback(
    async (filterOverride) => {
      const f = filterOverride !== undefined ? filterOverride : filters;
      const params = buildParams(searchQuery, f);
      await users.getUsers(params);
    },
    [searchQuery, filters, buildParams, users]
  );

  useEffect(() => {
    const t = setTimeout(() => loadUsers(), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleApplyFilters = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      loadUsers(newFilters);
    },
    [loadUsers]
  );

  const hasActiveFilters = !!(filters.state || filters.district || filters.pincode);
  const userList = users.users || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: c.surface }]}>
          <Icon name="search" size={22} color={c.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search professionals..."
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

      <Text style={[styles.sectionTitle, { color: c.accent }]}>FEATURED PROFESSIONALS</Text>

      {users.loading && userList.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      ) : userList.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Icon name="groups" size={48} color={c.textSecondary} />
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>No service providers found</Text>
        </View>
      ) : (
        <FlatList
          data={userList}
          keyExtractor={(item) => item._id || item.id}
          renderItem={({ item }) => (
            <UserCard item={item} colors={c} onViewProfile={(user) => navigation?.navigate('User Details', { user })} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={users.loading} onRefresh={loadUsers} colors={[c.accent]} />
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
    padding: 16,
  },
  cardInner: {
    gap: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBlock: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profession: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 13,
    flex: 1,
  },
  separator: {
    fontSize: 13,
  },
  rating: {
    fontSize: 13,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  status: {
    fontSize: 12,
  },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '700',
  },
  arrowIcon: {
    marginLeft: 4,
  },
});

export default UsersScreen;
