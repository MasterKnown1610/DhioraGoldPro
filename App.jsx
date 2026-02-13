import React from 'react';
import ContextState from './context/ContextState';
import AppNavigator from './components/AppNavigator';

export default function App() {
  return (
    <ContextState>
      <AppNavigator />
    </ContextState>
  );
}
