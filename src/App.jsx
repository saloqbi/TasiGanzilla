import React from 'react';
import { ToolProvider } from './context/ToolContext';
import { LanguageProvider } from './context/LanguageContext';
import GannzillaBareWheelV224 from './components/GannTools/GannzillaBareWheelV224';
import GannzillaMovableRedGreenProtractorFrameV390 from './components/GannTools/GannzillaMovableRedGreenProtractorFrameV390';

// Exact v391 preview: open directly to the restored Gannzilla wheel.
const App = () => (
  <ToolProvider>
    <LanguageProvider>
      <div data-gannzilla-build="391">
        <GannzillaBareWheelV224 />
        <GannzillaMovableRedGreenProtractorFrameV390 />
      </div>
    </LanguageProvider>
  </ToolProvider>
);

export default App;
