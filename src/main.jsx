import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import GannzillaUnifiedDrawingPalettesV119 from './components/GannTools/GannzillaUnifiedDrawingPalettesV119';
import './styles/globals.css';

const isGannzillaProWheelMode = window.location.search.includes('gannzillaPro=true')
  || window.location.search.includes('wheelPro=true');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    {isGannzillaProWheelMode && <GannzillaUnifiedDrawingPalettesV119 />}
  </React.StrictMode>
);
