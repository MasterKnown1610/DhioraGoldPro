// without table

import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import CustomButton from './CustomButton';

const PurityConverter = () => {
  const [inputValues, setInputValues] = useState({
    weight: '',
    present: '',
    converted: '',

  });

  const [result1, setResult1] = useState('');
  const [result2, setResult2] = useState('');
  const [result3, setWeight] = useState('');
  const [currentPurity, setPurity] = useState('');
  const [requiredPurity, setrequiredPurity] = useState('');
  const [impure,setImpure] = useState('');

  const handleInputChange = (name, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleCalculate = () => {
    // Check if input values are empty and set them to zero
    const weight = inputValues.weight === '' ? 0 : parseFloat(inputValues.weight);
    const present = inputValues.present === '' ? 0 : parseFloat(inputValues.present);
    const converted = inputValues.converted === '' ? 0 : parseFloat(inputValues.converted);
  
    const fistPercentage = present / 100;
    const secoundPer = converted / 100;
  
    const pureWeight = weight * fistPercentage;
    const conWeight = pureWeight / secoundPer;
    const impurity = conWeight - pureWeight;
  
    setResult1(`Pure Gold: ${pureWeight.toFixed(4)}`);
    setResult2(`Converted Gold : ${conWeight.toFixed(4)}`);
    setWeight(`Current Weight : ${weight.toFixed(4)}`);
    setPurity(`Current-Purity:${present.toFixed(4)}`);
    setrequiredPurity(`Required-Purity:${converted.toFixed(4)}`);
    setImpure(`Required Metal: ${impurity.toFixed(4)}`);
  
    // Clear input values after calculation
    setInputValues({
      weight: '',
      present: '',
      converted: '',
    });
  };

  return (
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
        <Text style={styles.label}>Current-Purity:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter current purity"
          keyboardType="numeric"
          value={inputValues.present}
          onChangeText={(text) => handleInputChange('present', text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Required-Purity</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Required purity"
          keyboardType="numeric"
          value={inputValues.converted}
          onChangeText={(text) => handleInputChange('converted', text)}
        />
      </View>

      <CustomButton title="Calculate" onPress={handleCalculate} />

      <ScrollView style={styles.resultContainer} vertical>
        <Text style={styles.resultText}>{result3}</Text>
        <Text style={styles.resultText}>{currentPurity}</Text>
        <Text style={styles.resultText}>{requiredPurity}</Text>
        <View style={styles.resultGap} />
        <View style={styles.resultGap} />
        <Text style={styles.resultText}>{result1}</Text>
        <View style={styles.resultGap} />
        <Text style={styles.resultText}>{result2}</Text>
        <View style={styles.resultGap}/>
        <Text style={styles.resultText}>{impure}</Text>
        <View style={styles.resultGap}/>
        <Text></Text>
        {/* Add more Text components for additional results */} 
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
    width: 110, // Adjust as needed for proper alignment
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
    height: 450, // Adjust as needed
    borderRadius:20,
  },
  resultText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 8,
    marginLeft:10,
    marginTop:10,
  },
  resultGap: {
    height: 10, // Adjust as needed for the desired gap
  },
});

export default PurityConverter;



