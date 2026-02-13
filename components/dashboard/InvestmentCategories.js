import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CATEGORIES = [
  { id: 'watches', label: 'WATCHES', icon: 'watch' },
  { id: 'jewelry', label: 'JEWELRY', icon: 'diamond' },
  { id: 'exotics', label: 'EXOTICS', icon: 'car' },
  { id: 'fine-art', label: 'FINE ART', icon: 'palette' },
  { id: 'estates', label: 'ESTATES', icon: 'domain' },
  { id: 'rare-finds', label: 'RARE FINDS', icon: 'star' },
];

const InvestmentCategories = ({ onCategoryPress }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Investment Categories</Text>
    <View style={styles.grid}>
      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={styles.categoryCard}
          onPress={() => onCategoryPress?.(cat)}
          activeOpacity={0.8}
        >
          <View style={styles.iconWrapper}>
            <Icon name={cat.icon} size={32} color="#F8C24D" />
          </View>
          <Text style={styles.categoryLabel}>{cat.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    minHeight: 100,
  },
  iconWrapper: {
    marginBottom: 10,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
});

export default InvestmentCategories;
