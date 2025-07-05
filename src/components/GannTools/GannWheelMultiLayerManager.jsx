import React, { useState } from 'react';
import GannWheel from './GannWheel';

const GannWheelMultiLayerManager = () => {
  const [layers, setLayers] = useState([
    { id: Date.now(), name: "العجلة 1", visible: true }
  ]);

  const addLayer = () => {
    const newId = Date.now();
    setLayers([...layers, { id: newId, name: `العجلة ${layers.length + 1}`, visible: true }]);
  };

  const removeLayer = (id) => {
    setLayers(layers.filter(layer => layer.id !== id));
  };

  const toggleVisibility = (id) => {
    setLayers(layers.map(layer => layer.id === id ? { ...layer, visible: !layer.visible } : layer));
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#111', color: '#FFD700', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>🧿 Gann Wheel - طبقات متعددة</h2>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button onClick={addLayer} style={{ backgroundColor: '#004080', color: '#fff', padding: '8px 16px', borderRadius: '6px', border: 'none' }}>
          ➕ إضافة عجلة جديدة
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {layers.map(layer => (
          <div key={layer.id} style={{ border: '1px solid #444', padding: '10px', borderRadius: '6px' }}>
            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <strong>{layer.name}</strong>
              <div>
                <button onClick={() => toggleVisibility(layer.id)} style={{ marginRight: '10px' }}>
                  {layer.visible ? '👁️ إخفاء' : '✅ عرض'}
                </button>
                <button onClick={() => removeLayer(layer.id)} style={{ color: 'red' }}>🗑️ حذف</button>
              </div>
            </div>
            {layer.visible && <GannWheel id={layer.id} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GannWheelMultiLayerManager;
