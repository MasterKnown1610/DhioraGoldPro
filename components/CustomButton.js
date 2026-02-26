// CustomButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ title, onPress, disabled = false, style }) => (
  <TouchableOpacity
    style={[styles.customButton, disabled && styles.customButtonDisabled, style]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={disabled ? 1 : 0.7}
  >
    <Text style={[styles.customButtonText, disabled && styles.customButtonTextDisabled]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  customButton: {
    backgroundColor: '#F8C24D',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.8,
  },
  customButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customButtonTextDisabled: {
    color: '#666666',
  },
});

export default CustomButton;
