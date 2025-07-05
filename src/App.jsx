import React from 'react';
import { ToolProvider } from './context/ToolContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';

const App = () => (
  <ToolProvider>
    <LanguageProvider>
      <Home />
    </LanguageProvider>
  </ToolProvider>
);

export default App;