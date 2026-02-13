import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Context from '../../context/Context';

const MOCK_USERS = [
  {
    id: '1',
    name: 'Alexander Sterling',
    profession: 'BESPOKE ARCHITECTURAL CONSULTANT',
    location: 'Upper East Side, New York, NY',
    rating: 4.9,
    status: 'AVAILABLE NOW',
    verified: true,
    isFavorite: false,
    experience: '15 Yrs',
    projects: '120+',
    servicePhilosophy:
      'Crafting timeless spaces through the intersection of classical aesthetics and modern functionality. Specializing in high-end residential estates and private boutique commercial developments across the Tri-State area.',
    serviceArea: 'AVAILABLE IN MANHATTAN & BROOKLYN',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  },
  {
    id: '2',
    name: 'Elena Rodriguez',
    profession: 'LUXURY ARCHITECT',
    location: 'Miami, FL',
    rating: 5.0,
    status: 'NEXT SLOT: TOMORROW',
    verified: false,
    isFavorite: true,
    experience: '12 Yrs',
    projects: '85+',
    servicePhilosophy:
      'Blending contemporary design with sustainable practices. Focused on creating iconic structures that inspire and endure.',
    serviceArea: 'AVAILABLE IN MIAMI & SOUTH FLORIDA',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  },
  {
    id: '3',
    name: 'Marcus Thorne',
    profession: 'BESPOKE TAILORING',
    location: 'Beverly Hills, CA',
    rating: 4.8,
    status: 'PREMIUM PARTNER',
    verified: false,
    isFavorite: false,
    experience: '20 Yrs',
    projects: '200+',
    servicePhilosophy:
      'Handcrafted luxury tailoring for discerning clients. Every garment tells a story of precision and elegance.',
    serviceArea: 'AVAILABLE IN LOS ANGELES & BEVERLY HILLS',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
  {
    id: '4',
    name: 'Sarah Jenkins',
    profession: 'JEWELRY DESIGNER',
    location: 'Dallas, TX',
    rating: 4.9,
    status: 'AVAILABLE NOW',
    verified: false,
    isFavorite: false,
    experience: '8 Yrs',
    projects: '45+',
    servicePhilosophy:
      'Creating bespoke jewelry that celebrates life\'s milestones. Fine craftsmanship meets contemporary design.',
    serviceArea: 'AVAILABLE IN DALLAS & NORTH TEXAS',
    image: null,
  },
];

const FilterButton = ({ label, onPress, colors }) => (
  <TouchableOpacity
    style={[styles.filterBtn, { backgroundColor: colors.surface }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[styles.filterLabel, { color: colors.text }]}>{label}</Text>
    <Icon name="keyboard-arrow-down" size={20} color={colors.textSecondary} />
  </TouchableOpacity>
);

const UserCard = ({ item, colors, onViewProfile }) => {
  const c = colors;
  const [isFavorite, setIsFavorite] = useState(item.isFavorite);

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <View style={styles.cardInner}>
        <View style={styles.profileRow}>
          <View style={styles.imageWrapper}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.avatar} resizeMode="cover" />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: c.surfaceSecondary }]}>
                <Icon name="person" size={40} color={c.accent} />
              </View>
            )}
            {item.verified && (
              <View style={[styles.verifiedBadge, { backgroundColor: c.accent }]}>
                <Icon name="check" size={14} color={c.accentText} />
              </View>
            )}
          </View>
          <View style={styles.infoBlock}>
            <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.profession, { color: c.accent }]} numberOfLines={1}>
              {item.profession}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.favoriteBtn}
          >
            <Icon
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={24}
              color={isFavorite ? c.accent : c.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.locationRow}>
          <Icon name="location-on" size={14} color={c.textSecondary} />
          <Text style={[styles.location, { color: c.textSecondary }]} numberOfLines={1}>
            {item.location}
          </Text>
          <Text style={[styles.separator, { color: c.textSecondary }]}> • </Text>
          <Icon name="star" size={14} color={c.accent} />
          <Text style={[styles.rating, { color: c.textSecondary }]}>{item.rating}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={[styles.status, { color: c.textSecondary }]}>{item.status}</Text>
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
  const { theme } = useContext(Context);
  const c = theme.colors;
  const [searchQuery, setSearchQuery] = useState('');

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
          style={[styles.filterIconBtn, { backgroundColor: c.surface }]}
          activeOpacity={0.8}
        >
          <Icon name="filter-list" size={24} color={c.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <FilterButton label="State" colors={c} onPress={() => {}} />
        <FilterButton label="District" colors={c} onPress={() => {}} />
        <FilterButton label="Pincode" colors={c} onPress={() => {}} />
      </View>

      <Text style={[styles.sectionTitle, { color: c.accent }]}>FEATURED PROFESSIONALS</Text>

      <FlatList
        data={MOCK_USERS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserCard item={item} colors={c} onViewProfile={(user) => navigation?.navigate('User Details', { user })} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 10,
  },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
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
  favoriteBtn: {
    padding: 4,
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
