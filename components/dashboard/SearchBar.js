import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search luxury items, boutiques, or collectors',
  colors = {},
  onPress,
  editable = true,
}) => {
  const c = { surface: '#2A2A2A', text: '#fff', textSecondary: '#666', ...colors };
  const content = (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      <Icon name="search" size={22} color={c.textSecondary} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: c.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.textSecondary}
        returnKeyType="search"
        editable={editable}
        pointerEvents={onPress ? 'none' : 'auto'}
      />
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
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
