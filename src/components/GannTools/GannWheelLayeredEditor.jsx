import React, { useState } from 'react';
import GannWheel from './GannWheel';

const GannWheelLayeredEditor = () => {
  const [layers, setLayers] = useState([
    {
      id: Date.now(),
      name: 'طبقة 1',
      rotation: 0,
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
        rotation: 0,
        labels: [],
        visible: true
      }
    ]);
  };

  const updateLabel = (layerId, index, field, value) => {
    setLayers(prev =>
      prev.map(layer => {
        if (layer.id !== layerId) return layer;
        const updatedLabels = [...layer.labels];
        updatedLabels[index][field] = value;
        return { ...layer, labels: updatedLabels };
      })
    );
  };

  const toggleLayer = (id) => {
    setLayers(prev =>
      prev.map(layer => layer.id === id ? { ...layer, visible: !layer.visible } : layer)
    );
  };

  const removeLayer = (id) => {
    setLayers(prev => prev.filter(layer => layer.id !== id));
  };

  const rotateLayer = (id, delta) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === id ? { ...layer, rotation: (layer.rotation + delta + 360) % 360 } : layer
      )
    );
  };

  const mergedPrimaryLabels = layers
    .filter(layer => layer.visible)
    .flatMap(layer =>
      layer.labels.map(label => ({
        ...label,
        angle: label.angle + layer.rotation
      }))
    );

  return (
    <div style={{ backgroundColor: '#111', color: '#FFD700', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>🧿 Gann Wheel مع طبقات متعددة فوق عجلة واحدة</h2>

      <button
        onClick={addLayer}
        style={{ backgroundColor: '#004080', color: '#fff', padding: '8px 16px', borderRadius: '6px', border: 'none', marginBottom: '20px' }}
      >
        ➕ إضافة طبقة
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
        {layers.map(layer => (
          <div key={layer.id} style={{ border: '1px solid #444', padding: '10px', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong>{layer.name}</strong>
              <div>
                <button onClick={() => rotateLayer(layer.id, 15)}>🔁 تدوير +15°</button>
                <button onClick={() => rotateLayer(layer.id, -15)} style={{ marginLeft: '5px' }}>↩️ -15°</button>
                <button onClick={() => toggleLayer(layer.id)} style={{ marginLeft: '10px' }}>
                  {layer.visible ? '👁️ إخفاء' : '✅ عرض'}
                </button>
                <button onClick={() => removeLayer(layer.id)} style={{ marginLeft: '10px', color: 'red' }}>🗑️ حذف</button>
              </div>
            </div>
            {layer.labels.map((label, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                <input value={label.text} onChange={e => updateLabel(layer.id, idx, 'text', e.target.value)} />
                <input type="number" value={label.angle} onChange={e => updateLabel(layer.id, idx, 'angle', parseFloat(e.target.value))} />
                <input type="color" value={label.color} onChange={e => updateLabel(layer.id, idx, 'color', e.target.value)} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <GannWheel width={600} height={600} primaryLabels={mergedPrimaryLabels} />
    </div>
  );
};

export default GannWheelLayeredEditor;
