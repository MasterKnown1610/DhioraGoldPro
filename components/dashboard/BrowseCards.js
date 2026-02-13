import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BrowseCards = ({ selected, onSelectShops, onSelectUsers, colors = {} }) => {
  const c = { surface: '#2A2A2A', accent: '#F8C24D', textSecondary: '#888', accentText: '#1A1A1A', ...colors };
  return (
  <View style={styles.container}>
    <TouchableOpacity
      style={[styles.card, { backgroundColor: selected === 'shops' ? c.accent : c.surface }, selected === 'shops' && styles.cardSelected]}
      onPress={onSelectShops}
      activeOpacity={0.8}
    >
      <Icon
        name="storefront"
        size={36}
        color={selected === 'shops' ? c.accentText : c.accent}
        style={styles.cardIcon}
      />
      <Text
        style={[
          styles.cardText,
          { color: selected === 'shops' ? c.accentText : c.text },
        ]}
      >
        Browse Shops
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.card, { backgroundColor: selected === 'users' ? c.accent : c.surface }, selected === 'users' && styles.cardSelected]}
      onPress={onSelectUsers}
      activeOpacity={0.8}
    >
      <Icon
        name="group"
        size={36}
        color={selected === 'users' ? c.accentText : c.textSecondary}
        style={styles.cardIcon}
      />
      <Text
        style={[
          styles.cardText,
          { color: selected === 'users' ? c.accentText : c.textSecondary },
        ]}
      >
        Browse Users
      </Text>
    </TouchableOpacity>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  cardSelected: {
    backgroundColor: '#F8C24D',
  },
  cardIcon: {
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BrowseCards;
