
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import CustomButton from './CustomButton';

const GoldConverter = () => {
  const [presentWeight, setPresentWeight] = useState('');
  const [thulam, setThulam] = useState('');
  const [visam, setVisam] = useState('');
  const [gurija, setGurija] = useState('');

  const convertToPresentWeight = () => {
    const thulamWeight = parseFloat(thulam) || 0;
    const visamWeight = parseFloat(visam) || 0;
    const gurijaWeight = parseFloat(gurija) || 0;

    const totalWeight = thulamWeight * 11.664 + visamWeight * 0.729 + gurijaWeight * 0.1215;
    setPresentWeight(totalWeight.toFixed(3));
  };

  const convertToOldWeight = () => {
    const tolerance = 1e-10; // Define a small tolerance value

    // Utility function for rounding
    const roundTo = (value, precision) => {
        const multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    };

    console.log(presentWeight, "this is the present weight normal");
    
    const presentWeightInGrams = parseFloat(presentWeight) || 0;

    console.log(presentWeightInGrams, "this is step one ========>>>");

    const thulaWeight = Math.floor(presentWeightInGrams / 11.664);
    console.log(thulaWeight, "this is step 2 ========>>>>>>>");

    // Remainder after Thula, rounded to a small number of decimal places
    let remainderAfterThula = roundTo(presentWeightInGrams % 11.664, 10);
    console.log(remainderAfterThula, "this is the remainder after Thula");

    // Use tolerance to check if remainderAfterThula is effectively zero
    remainderAfterThula = Math.abs(remainderAfterThula) < tolerance ? 0 : remainderAfterThula;

    const visamWeight = Math.floor(remainderAfterThula / 0.729);
    console.log(visamWeight, "this is step 3 ========>>>>>>>");

    // Remainder after Visam, rounded to a small number of decimal places
    let remainderAfterVisam = roundTo(remainderAfterThula % 0.729, 10);
    console.log(remainderAfterVisam, "this is the remainder after Visam");

    // Use tolerance to check if remainderAfterVisam is effectively zero
    remainderAfterVisam = Math.abs(remainderAfterVisam) < tolerance ? 0 : remainderAfterVisam;

    let gurijaWeight = remainderAfterVisam / 0.1215;
    gurijaWeight = roundTo(gurijaWeight, 10);
    console.log(gurijaWeight, "this is step 4 ========>>>>>>>");

    // Use tolerance to check if gurijaWeight is effectively zero
    const adjustedGurijaWeight = Math.abs(gurijaWeight) < tolerance ? 0 : gurijaWeight;

    setThulam(thulaWeight.toFixed(2));
    if (visamWeight < 16) {
        setVisam(visamWeight.toString());
    } else {
        setVisam((0).toString());
    }

    if (adjustedGurijaWeight < 6) {
        console.log(adjustedGurijaWeight, "this is the weight");
        let gurija = parseFloat(adjustedGurijaWeight).toFixed(3);
        console.log(gurija, "this is the gurija weight");
        setGurija(gurija);
    } else {
        setGurija(0);
    }
};



  const clearAllInputs = () => {
    setPresentWeight('');
    setThulam('');
    setVisam('');
    setGurija('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.inputBox}>
          <Text style={styles.header}>Thulam:</Text>
          <TextInput
            style={styles.input}
            placeholder="Thulam"
            keyboardType="numeric"
            value={thulam}
            onChangeText={(text) => setThulam(text)}
          />
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.header}>Visam:</Text>
          <TextInput
            style={styles.input}
            placeholder="Visam"
            keyboardType="numeric"
            value={visam}
            onChangeText={(text) => setVisam(text)}
          />
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.header}>Gurija:</Text>
          <TextInput
            style={styles.input}
            placeholder="Gurija"
            keyboardType="numeric"
            value={gurija}
            onChangeText={(text) => setGurija(text)}
          />
        </View>
      </View>
      <CustomButton title="Convert to Grams Weight" onPress={convertToPresentWeight} />
      <View style={styles.inputBox}>
        <Text style={styles.header}>Grams Weight:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Present weight"
          keyboardType="numeric"
          value={presentWeight}
          onChangeText={(text) => setPresentWeight(text)}
        />
        <CustomButton title="Convert to Old Weight" onPress={convertToOldWeight} />
      </View>
      <View style={styles.buttonsContainer}>
        
        
        <CustomButton title="Clear All Inputs" onPress={clearAllInputs} />
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputBox: {
    flex: 1,
    marginRight: 8,
    marginTop:10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 8,
    borderRadius:5,
  },
  buttonsContainer: {
    flexDirection: 'column',
    marginBottom: 16,
    gap: 12,    
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 16,
  },
  header:{
    fontWeight:'bold',
    fontSize:15,
    marginVertical:10
  }
});

export default GoldConverter;




