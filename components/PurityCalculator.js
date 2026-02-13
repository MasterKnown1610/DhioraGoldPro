// PurityCalculatorScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import CustomButton from './CustomButton';

const PurityCalculator = () => {
  const [inputValues, setInputValues] = useState({
    weight: '',
    cost: '',
    purity: '',
    charges: '',
  });

  const [result1, setResult1] = useState('');
  const [result2, setResult2] = useState('');
  const [result3, setResult3] = useState('');

  const[weight,setWeight]=useState('');
  const[cost,setCost]=useState('');
  const[purity,setPurity]=useState('');
  const[charges,setCharges]=useState('');

  const handleInputChange = (name, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleCalculate = () => {
    // Check if input values are empty and set them to zero
    const weight = inputValues.weight === '' ? 0 : parseFloat(inputValues.weight);
    const cost = inputValues.cost === '' ? 0 : parseFloat(inputValues.cost);
    const purity = inputValues.purity === '' ? 0 : parseFloat(inputValues.purity);
    const charges = inputValues.charges === '' ? 0 : parseFloat(inputValues.charges);

    const percentage = purity / 100;
    const pureGold = weight * percentage;
    const goldCost = pureGold * cost;
    const totalCost = goldCost+charges;

    setResult1(`Pure Gold: ${pureGold.toFixed(4)}`);
    setResult2(`Pure Gold Cost: ${goldCost.toFixed(4)}`);
    setResult3(`Total Amount:${totalCost.toFixed(4)}`);

    setWeight(`Weight : ${weight.toFixed(4)}`);
    setCost(`Cost : ${cost.toFixed(2)}`);
    setPurity(`Purity : ${purity.toFixed(4)}`);
    setCharges(`Charges : ${charges.toFixed(2)}`);
    // Clear input values after calculation
    setInputValues({
      weight: '',
      cost: '',
      purity: '',
      charges: '',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Weight:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter weight"
          keyboardType="numeric"
          value={inputValues.weight}
          onChangeText={(text) => handleInputChange('weight', text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Cost/grm:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter cost"
          keyboardType="numeric"
          value={inputValues.cost}
          onChangeText={(text) => handleInputChange('cost', text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Purity:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter purity"
          keyboardType="numeric"
          value={inputValues.purity}
          onChangeText={(text) => handleInputChange('purity', text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Charges:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter charges"
          keyboardType="numeric"
          value={inputValues.charges}
          onChangeText={(text) => handleInputChange('charges', text)}
        />
      </View>
      <CustomButton title="Calculate" onPress={handleCalculate} />

      <ScrollView style={styles.resultContainer} vertical>
        <Text style={styles.resultText}>{weight}</Text>
        <Text style={styles.resultText}>{cost}</Text>
        <Text style={styles.resultText}>{purity}</Text>
        <Text style={styles.resultText}>{charges}</Text>
        <View style={styles.resultGap} />
        <View style={styles.resultGap} />
        <Text style={styles.resultText}>{result1}</Text>
        <View style={styles.resultGap} />
        <Text style={styles.resultText}>{result2}</Text>
        <View style={styles.resultGap} />
        <Text style={styles.resultText}>{result3}</Text>
        {/* Add more Text components for additional results */}
      </ScrollView>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    width: 70, // Adjust as needed for proper alignment
    marginRight: 10,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 8,
  },
  resultContainer: {
    backgroundColor: 'black',
    padding: 10,
    marginTop: 20,
    height: 450,
    borderRadius:20,
    // Use maxHeight instead of height for better responsiveness
  },
  resultText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 8,
    marginLeft: 5,
    marginTop:5 // Add left margin for better alignment
  },
  resultGap: {
    height: 5, // Reduce the gap for better spacing
  },
});




export default PurityCalculator;
