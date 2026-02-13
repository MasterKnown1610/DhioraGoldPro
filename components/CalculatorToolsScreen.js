import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import CustomButton from './CustomButton';
import Context from '../context/Context';

const CalculatorToolsScreen = ({ navigation }) => {
  const { theme } = useContext(Context);
  const c = theme.colors;
  return (
  <SafeAreaView style={[styles.safearea, { backgroundColor: c.background }]}>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/birdGold.png')} style={styles.logo} />
        <Text style={[styles.title, { color: c.text }]}>Gold Calculator</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <CustomButton
          title="Thula Converter"
          onPress={() => navigation.navigate('Gold Converter')}
        />
        <CustomButton
          title="Purity Converter"
          onPress={() => navigation.navigate('Purity Converter')}
        />
        <CustomButton
          title="Purity Calculator"
          onPress={() => navigation.navigate('Purity Calculator')}
        />
        <CustomButton
          title="Purity Generator"
          onPress={() => navigation.navigate('Purity Generator')}
        />
      </View>
    </ScrollView>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 12,
  },
  buttonsContainer: {
    width: '85%',
    gap: 16,
  },
});

export default CalculatorToolsScreen;
