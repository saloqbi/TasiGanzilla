import React, { useState } from 'react';
import GannWheel from './GannWheel';

const GannWheelWithLayersSingle = () => {
  const [layers, setLayers] = useState([
    {
      id: Date.now(),
      name: 'الطبقة 1',
      labels: [
        { text: 'A', angle: 0, color: '#FFD700' },
        { text: 'B', angle: 90, color: '#00CED1' }
      ],
      visible: true
    }
  ]);

  const addLayer = () => {
    const newId = Date.now();
    setLayers([
      ...layers,
      {
        id: newId,
        name: `طبقة ${layers.length + 1}`,
        labels: [],
        visible: true
      }
    ]);
  };

  const removeLayer = (id) => {
    setLayers(layers.filter(layer => layer.id !== id));
  };

  const toggleLayer = (id) => {
    setLayers(layers.map(layer => layer.id === id ? { ...layer, visible: !layer.visible } : layer));
  };

  const updateLabel = (layerId, index, field, value) => {
    const updated = layers.map(layer => {
      if (layer.id !== layerId) return layer;
      const newLabels = [...layer.labels];
      newLabels[index][field] = value;
      return { ...layer, labels: newLabels };
    });
    setLayers(updated);
  };

  const renderLayerControls = () => (
    <div style={{ marginBottom: '20px' }}>
      <button onClick={addLayer} style={{ marginBottom: '10px', backgroundColor: '#004080', color: '#fff', padding: '8px', borderRadius: '6px' }}>
        ➕ إضافة طبقة
      </button>
      {layers.map(layer => (
        <div key={layer.id} style={{ border: '1px solid #333', padding: '10px', marginTop: '10px' }}>
          <strong>{layer.name}</strong>
          <button onClick={() => toggleLayer(layer.id)} style={{ marginLeft: '10px' }}>
            {layer.visible ? '👁️ إخفاء' : '👁️ عرض'}
          </button>
          <button onClick={() => removeLayer(layer.id)} style={{ marginLeft: '10px', color: 'red' }}>🗑️ حذف</button>

          {layer.labels.map((label, i) => (
            <div key={i} style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
              <input value={label.text} onChange={e => updateLabel(layer.id, i, 'text', e.target.value)} />
              <input type="number" value={label.angle} onChange={e => updateLabel(layer.id, i, 'angle', parseFloat(e.target.value))} />
              <input type="color" value={label.color} onChange={e => updateLabel(layer.id, i, 'color', e.target.value)} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const allVisibleLabels = layers.filter(l => l.visible).flatMap(l => l.labels);

  return (
    <div style={{ backgroundColor: '#111', color: '#FFD700', padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>🧿 Gann Wheel مع طبقات متعددة (عجلة واحدة)</h2>
      {renderLayerControls()}
      <GannWheel width={600} height={600} labels={allVisibleLabels} />
    </div>
  );
};

export default GannWheelWithLayersSingle;
