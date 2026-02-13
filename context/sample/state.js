import {useReducer} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import Reducer from './reducer';

export const initialState = {
  categories: [],
};

export const CategoriesState = () => {
  const [state, dispatch] = useReducer(Reducer, initialState);
 

  return {
    ...state,
   
  };
};
