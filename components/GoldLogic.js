import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView } from 'react-native';
import CustomButton from './CustomButton';

const GoldLogic = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safearea}>
      <View style={styles.logoContainer}>
        {/* Replace 'your_logo_source' with the actual source of your logo */}
        <Image source={require('../assets/birdGold.png')} style={styles.logo} />
        <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'white' }}>Gold Calculator</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <View style={styles.row}>
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
        {/* <View style={styles.row}>
         
        
        </View> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100, // Adjust the width of the logo as needed
    height: 100, // Adjust the height of the logo as needed
    resizeMode: 'contain',
  },
  buttonsContainer: {
    width: '80%', // Adjust the width of the button container as needed
  },
  row: {
    flexDirection: 'column',
    gap:20,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  butstyle:{
    color:'red',
  },
  naviagteor:{
    color:'black',
  }
});

export default GoldLogic;
