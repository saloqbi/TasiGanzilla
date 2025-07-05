import React, { useState } from 'react';
import GannWheel from './GannWheel';

const GannWheelLayersWrapper = () => {
  const [primaryLayers, setPrimaryLayers] = useState([
    {
      id: Date.now(),
      name: 'طبقة أساسية 1',
      labels: [
        { text: 'N', angle: 270, color: '#FF6347' },
        { text: 'E', angle: 0, color: '#40E0D0' }
      ],
      visible: true
    }
  ]);

  const [secondaryLayers, setSecondaryLayers] = useState([
    {
      id: Date.now() + 1,
      name: 'طبقة داخلية 1',
      labels: [
        { text: 'A', angle: 15, color: '#FFD700' },
        { text: 'B', angle: 90, color: '#DA70D6' }
      ],
      visible: true
    }
  ]);

  const addPrimaryLayer = () => {
    const newId = Date.now();
    setPrimaryLayers([
      ...primaryLayers,
      { id: newId, name: `طبقة أساسية ${primaryLayers.length + 1}`, labels: [], visible: true }
    ]);
  };

  const addSecondaryLayer = () => {
    const newId = Date.now();
    setSecondaryLayers([
      ...secondaryLayers,
      { id: newId, name: `طبقة داخلية ${secondaryLayers.length + 1}`, labels: [], visible: true }
    ]);
  };

  const updateLabel = (layerType, layerId, index, field, value) => {
    const update = (layers, setLayers) => {
      const updated = layers.map(layer => {
        if (layer.id !== layerId) return layer;
        const labels = [...layer.labels];
        labels[index][field] = value;
        return { ...layer, labels };
      });
      setLayers(updated);
    };
    if (layerType === 'primary') update(primaryLayers, setPrimaryLayers);
    if (layerType === 'secondary') update(secondaryLayers, setSecondaryLayers);
  };

  const toggleLayer = (layerType, id) => {
    const toggle = (layers, setLayers) => {
      setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
    };
    if (layerType === 'primary') toggle(primaryLayers, setPrimaryLayers);
    if (layerType === 'secondary') toggle(secondaryLayers, setSecondaryLayers);
  };

  const removeLayer = (layerType, id) => {
    const remove = (layers, setLayers) => {
      setLayers(layers.filter(l => l.id !== id));
    };
    if (layerType === 'primary') remove(primaryLayers, setPrimaryLayers);
    if (layerType === 'secondary') remove(secondaryLayers, setSecondaryLayers);
  };

  const renderLayerControls = (layers, type) => (
    <>
      {layers.map(layer => (
        <div key={layer.id} style={{ border: '1px solid #444', padding: '10px', marginBottom: '10px' }}>
          <strong>{layer.name}</strong>
          <button onClick={() => toggleLayer(type, layer.id)} style={{ marginLeft: '10px' }}>
            {layer.visible ? '👁️ إخفاء' : '👁️ عرض'}
          </button>
          <button onClick={() => removeLayer(type, layer.id)} style={{ marginLeft: '10px', color: 'red' }}>🗑️ حذف</button>
          {layer.labels.map((label, i) => (
            <div key={i} style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
              <input value={label.text} onChange={e => updateLabel(type, layer.id, i, 'text', e.target.value)} />
              <input type="number" value={label.angle} onChange={e => updateLabel(type, layer.id, i, 'angle', parseFloat(e.target.value))} />
              <input type="color" value={label.color} onChange={e => updateLabel(type, layer.id, i, 'color', e.target.value)} />
            </div>
          ))}
        </div>
      ))}
    </>
  );

  const primaryLabels = primaryLayers.filter(l => l.visible).flatMap(l => l.labels);
  const secondaryLabels = secondaryLayers.filter(l => l.visible).flatMap(l => l.labels);

  return (
    <div style={{ backgroundColor: '#111', color: '#FFD700', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>🧿 Gann Wheel مع طبقات متعددة داخل عجلة واحدة</h2>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={addPrimaryLayer} style={{ marginRight: '10px', backgroundColor: '#007ACC', color: '#fff', padding: '8px', borderRadius: '6px' }}>➕ طبقة أساسية</button>
        <button onClick={addSecondaryLayer} style={{ backgroundColor: '#8A2BE2', color: '#fff', padding: '8px', borderRadius: '6px' }}>➕ طبقة داخلية</button>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div>{renderLayerControls(primaryLayers, 'primary')}</div>
        <div>{renderLayerControls(secondaryLayers, 'secondary')}</div>
      </div>

      <GannWheel width={600} height={600} primaryLabels={primaryLabels} secondaryLabels={secondaryLabels} />
    </div>
  );
};

export default GannWheelLayersWrapper;
