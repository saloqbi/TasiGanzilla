import React, { useState } from 'react';
import GannWheel from './GannWheel';

const GannWheelWithLayers = () => {
  const [layers, setLayers] = useState([{ id: Date.now() }]);

  const addLayer = () => {
    setLayers([...layers, { id: Date.now() }]);
  };

  const removeLayer = (id) => {
    setLayers(layers.filter(layer => layer.id !== id));
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#111', color: '#FFD700' }}>
      <h1 style={{ textAlign: 'center' }}>🧿 كوكبة الأرقام السحرية</h1>
      <h2 style={{ textAlign: 'center' }}>Gann Wheel مع طبقات متعددة</h2>

      <div style={{ textAlign: 'center', margin: '20px' }}>
        <button
          onClick={addLayer}
          style={{ backgroundColor: '#004080', color: '#fff', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
        >
          ➕ إضافة طبقة جديدة
        </button>
      </div>

      {layers.map((layer) => (
        <div key={layer.id} style={{ border: '1px solid #333', margin: '20px 0', padding: '10px', borderRadius: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <button
              onClick={() => removeLayer(layer.id)}
              style={{ backgroundColor: 'darkred', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
            >
              🗑️ حذف هذه الطبقة
            </button>
          </div>
          <GannWheel id={layer.id} /> {/* تمرير ID مميز لكل طبقة */}
        </div>
      ))}
    </div>
  );
};

export default GannWheelWithLayers;
