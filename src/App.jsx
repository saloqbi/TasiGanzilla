import React from 'react';
import { ToolProvider } from './context/ToolContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home';
import SimpleTriangleTest from './components/GannTools/SimpleTriangleTest';
import InteractiveTriangle from './components/InteractiveTriangle';

const App = () => (
  <ToolProvider>
    <LanguageProvider>
      <div>
        {/* <InteractiveTriangle />
        <hr style={{ margin: "20px 0" }} />
        <SimpleTriangleTest />
        <hr style={{ margin: "20px 0" }} /> */}
        <Home />
      </div>
    </LanguageProvider>
  </ToolProvider>
);

export default App;