// CustomButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ title, onPress }) => (
  <TouchableOpacity style={styles.customButton} onPress={onPress}>
    <Text style={styles.customButtonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  customButton: {
    backgroundColor: '#F8C24D',
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomButton;
