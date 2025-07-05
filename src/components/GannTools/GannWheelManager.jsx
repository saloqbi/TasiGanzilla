import React, { useState } from 'react';
import GannWheelLayer from './GannWheelLayer';

const GannWheelManager = () => {
  const [layers, setLayers] = useState([
    { id: 1, name: 'Wheel 1', visible: true },
  ]);

  const addLayer = () => {
    const newId = Date.now();
    setLayers([...layers, { id: newId, name: `Wheel ${layers.length + 1}`, visible: true }]);
  };

  const removeLayer = (id) => {
    setLayers(layers.filter(layer => layer.id !== id));
  };

  const toggleVisibility = (id) => {
    setLayers(layers.map(layer => layer.id === id ? { ...layer, visible: !layer.visible } : layer));
  };

  return (
    <div style={{ backgroundColor: '#111', color: '#FFD700', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🧿 كوكبة الأرقام السحرية</h1>
      <h2>إدارة طبقات Gann Wheel</h2>

      <button onClick={addLayer} style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#004080', color: '#fff', border: 'none', borderRadius: '5px' }}>
        ➕ إضافة طبقة جديدة
      </button>

      {layers.map(layer => (
        <div key={layer.id} style={{ marginBottom: '20px', border: '1px solid #444', padding: '10px', borderRadius: '6px' }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>{layer.name}</strong>
            <button onClick={() => toggleVisibility(layer.id)} style={{ marginLeft: '10px' }}>
              {layer.visible ? '🚫 إخفاء' : '✅ عرض'}
            </button>
            <button onClick={() => removeLayer(layer.id)} style={{ marginLeft: '10px', color: 'red' }}>🗑️ حذف</button>
          </div>
          {layer.visible && <GannWheelLayer id={layer.id} />}
        </div>
      ))}
    </div>
  );
};

export default GannWheelManager;
