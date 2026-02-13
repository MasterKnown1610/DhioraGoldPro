import React, { useState } from 'react';
import { View, Text, TextInput,  ScrollView, StyleSheet } from 'react-native';
import CustomButton from './CustomButton';

const PurityGenerator = () => {
  const [inputValues, setInputValues] = useState({
    weight: '',
    percentage: '',


  });

  const [result1, setResult1] = useState('');

  const [Weight, setWeight] = useState('');
  const[percentage,setPercentage] = useState('');

  const handleInputChange = (name, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleCalculate = () => {
    // Check if input values are empty and set them to zero
    const weight = inputValues.weight === '' ? 0 : parseFloat(inputValues.weight);
    const present = inputValues.present === '' ? 0 : parseFloat(inputValues.percentage);


    const fistPercentage = present / 100;


    const pureWeight = weight * fistPercentage;


    setResult1(`Pure Gold: ${pureWeight.toFixed(4)}`);
    setWeight(`Weight : ${weight.toFixed(4)}`)
    setPercentage(`Current-Purity : ${present.toFixed(2)}`);


    // Clear input values after calculation
    setInputValues({
      weight: '',
      percentage: '',
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
          value={inputValues.percentage}
          onChangeText={(text) => handleInputChange('percentage', text)}
        />
      </View>
      

      <CustomButton title="Calculate" onPress={handleCalculate} />

      <ScrollView style={styles.resultContainer} vertical>
        <Text style={styles.resultText}>{Weight}</Text>
        <Text style={styles.resultText}>{percentage}</Text>
        <View style={styles.resultGap} />
        <View style={styles.resultGap} />
        <Text style={styles.resultText}>{result1}</Text>
        
        
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
    height: 500, // Adjust as needed
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

export default PurityGenerator;
