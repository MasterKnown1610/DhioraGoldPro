import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SearchBar = ({ value, onChangeText, placeholder = 'Search luxury items, boutiques, or collectors', colors = {} }) => {
  const c = { surface: '#2A2A2A', text: '#fff', textSecondary: '#666', ...colors };
  return (
  <View style={[styles.container, { backgroundColor: c.surface }]}>
    <Icon name="search" size={22} color={c.textSecondary} style={styles.icon} />
    <TextInput
      style={[styles.input, { color: c.text }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={c.textSecondary}
      returnKeyType="search"
    />
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
    height: 48,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
});

export default SearchBar;
