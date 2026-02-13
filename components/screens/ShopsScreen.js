import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Context from '../../context/Context';

const MOCK_SHOPS = [
  {
    id: '1',
    name: "Maison d'Or Luxury",
    address: '7th Avenue, Diamond District, New York, NY 10036',
    state: 'NEW YORK',
    city: 'MANHATTAN',
    status: 'closed',
    opensAt: '10:00 AM',
    closesAt: null,
    rating: 4.9,
    premium: true,
    phone: '+1 (212) 555-0147',
    about:
      "Maison d'Or Luxury offers an exquisite collection of fine gold jewelry and bespoke pieces. Our master craftsmen bring decades of tradition to every design, ensuring timeless elegance for discerning clients.",
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
    ],
  },
  {
    id: '2',
    name: 'Vogue Couture',
    address: 'Regent Street, North Square, London W1B 5RA',
    state: 'ENGLAND',
    city: 'LONDON',
    status: 'open',
    opensAt: null,
    closesAt: '9:00 PM',
    rating: 4.7,
    premium: false,
    phone: '+44 20 7946 0958',
    about:
      'Vogue Couture blends contemporary design with classic elegance. Discover our curated selection of luxury fashion and accessories, handpicked for the modern sophisticate.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    ],
  },
  {
    id: '3',
    name: 'Premium Electronics Hub',
    address: '123 Luxury Avenue, Golden Plaza, Suite 405, Los Angeles, CA 90012',
    state: 'CALIFORNIA',
    city: 'LOS ANGELES',
    status: 'open',
    opensAt: null,
    closesAt: '7:00 PM',
    rating: 4.8,
    premium: true,
    phone: '+1 (555) 000-1234',
    about:
      'Premium Electronics Hub is your one-stop destination for the latest high-end gadgets and home automation solutions. From state-of-the-art smartphones to immersive home cinema systems, we curate only the best technology for your lifestyle.',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600',
    images: [
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    ],
  },
];

const ShopCard = ({ item, colors, onViewDetails, onFavorite }) => {
  const c = colors;
  const [isFavorite, setIsFavorite] = useState(false);
  const statusText = item.status === 'open'
    ? `Open • Closes ${item.closesAt}`
    : `Closed now • Opens ${item.opensAt}`;

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
        {item.premium && (
          <View style={styles.premiumTag}>
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.favoriteBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={() => setIsFavorite(!isFavorite)}
          activeOpacity={0.8}
        >
          <Icon name={isFavorite ? 'favorite' : 'favorite-border'} size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.cardHeader}>
          <Text style={[styles.shopName, { color: c.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={[styles.ratingBadge, { backgroundColor: c.surfaceSecondary || c.background }]}>
            <Icon name="star" size={14} color={c.accent} />
            <Text style={[styles.ratingText, { color: c.text }]}>{item.rating}</Text>
          </View>
        </View>
        <View style={styles.locationRow}>
          <Icon name="location-on" size={14} color={c.textSecondary} style={styles.pinIcon} />
          <Text style={[styles.address, { color: c.textSecondary }]} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
        <Text style={styles.statusRow}>
          {item.status === 'open' ? (
            <Text style={styles.statusOpen}>Open</Text>
          ) : (
            <Text style={[styles.statusClosed, { color: c.textSecondary }]}>Closed now</Text>
          )}
          <Text style={[styles.statusTime, { color: c.textSecondary }]}>
            {item.status === 'open' ? ` • Closes ${item.closesAt}` : ` • Opens ${item.opensAt}`}
          </Text>
        </Text>
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

const ShopsScreen = ({ navigation }) => {
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
            placeholder="Search luxury boutiques..."
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

      <Text style={[styles.sectionTitle, { color: c.accent }]}>EXCLUSIVE COLLECTIONS</Text>

      <FlatList
        data={MOCK_SHOPS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ShopCard
            item={item}
            colors={c}
            onViewDetails={(shop) => navigation?.navigate('Shop Details', { shop })}
            onFavorite={() => {}}
          />
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
  favoriteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
  statusRow: {
    fontSize: 13,
    marginBottom: 12,
  },
  statusOpen: {
    color: '#22C55E',
    fontWeight: '600',
  },
  statusClosed: {},
  statusTime: {},
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
