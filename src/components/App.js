import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import AppRouter from './Router';

const App = () => {
  return (
    <HelmetProvider>
      <AppRouter />
    </HelmetProvider>
  );
}

export default App;
