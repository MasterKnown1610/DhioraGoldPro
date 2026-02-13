import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MOCK_BOUTIQUES = [
  {
    id: '1',
    name: 'Chronos & Co.',
    tagline: 'Exclusive Swiss Timepieces • Geneva',
    badge: 'TOP RATED',
    image: null,
  },
  {
    id: '2',
    name: 'The Canvas',
    tagline: 'Contemporary',
    badge: 'NEW ARRIVAL',
    image: null,
  },
  {
    id: '3',
    name: 'Heritage Gold',
    tagline: 'Traditional Craftsmanship',
    badge: null,
    image: null,
  },
];

const BoutiqueCard = ({ item, onPress, colors = {} }) => {
  const c = { surface: '#2A2A2A', surfaceSecondary: '#1F1F1F', text: '#fff', textSecondary: '#888', ...colors };
  return (
  <TouchableOpacity style={[styles.card, { backgroundColor: c.surface }]} onPress={onPress} activeOpacity={0.9}>
    <View style={styles.imageContainer}>
      {item.image ? (
        <Image source={item.image} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: c.surfaceSecondary }]}>
          <Icon name="store" size={48} color={c.textSecondary} />
        </View>
      )}
      {item.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      )}
    </View>
    <View style={styles.cardContent}>
      <Text style={[styles.cardTitle, { color: c.text }]}>{item.name}</Text>
      <Text style={[styles.cardTagline, { color: c.textSecondary }]}>{item.tagline}</Text>
    </View>
  </TouchableOpacity>
  );
};

const CuratedBoutiques = ({ onViewAll, onBoutiquePress, colors = {} }) => {
  const c = { text: '#fff', accent: '#F8C24D', surface: '#2A2A2A', textSecondary: '#888', ...colors };
  return (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: c.text }]}>Curated Boutiques</Text>
      <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
        <Text style={[styles.viewAll, { color: c.accent }]}>View All →</Text>
      </TouchableOpacity>
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {MOCK_BOUTIQUES.map((item) => (
        <BoutiqueCard
          key={item.id}
          item={item}
          onPress={() => onBoutiquePress?.(item)}
          colors={c}
        />
      ))}
    </ScrollView>
  </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingRight: 28,
  },
  card: {
    width: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#F8C24D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardTagline: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default CuratedBoutiques;
