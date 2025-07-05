import React, { useState } from 'react';

const GannWheelNestedLayers = () => {
  const [layers, setLayers] = useState([
    {
      id: Date.now(),
      name: 'طبقة 1',
      radius: 200,
      rotation: 0,
      labels: [
        { text: 'N', angle: 0, color: '#FFD700' },
        { text: 'E', angle: 90, color: '#40E0D0' },
        { text: 'S', angle: 180, color: '#90EE90' },
        { text: 'W', angle: 270, color: '#FF6347' }
      ],
      visible: true
    }
  ]);

  const center = { x: 300, y: 300 };

  const addLayer = () => {
    const newId = Date.now();
    setLayers([
      ...layers,
      {
        id: newId,
        name: `طبقة ${layers.length + 1}`,
        radius: 140 + layers.length * 30,
        rotation: 0,
        labels: [
          { text: 'A', angle: 45, color: '#FF69B4' },
          { text: 'B', angle: 135, color: '#7CFC00' }
        ],
        visible: true
      }
    ]);
  };

  const rotateLayer = (id, delta) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === id
          ? { ...layer, rotation: (layer.rotation + delta + 360) % 360 }
          : layer
      )
    );
  };

  const toggleLayer = (id) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const removeLayer = (id) => {
    setLayers(prev => prev.filter(layer => layer.id !== id));
  };

  const updateLabel = (layerId, idx, field, value) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === layerId
          ? {
              ...layer,
              labels: layer.labels.map((lbl, i) =>
                i === idx ? { ...lbl, [field]: value } : lbl
              )
            }
          : layer
      )
    );
  };

  return (
    <div style={{ backgroundColor: '#111', color: '#FFD700', padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>🧿 Gann Wheel - طبقات دائرية متداخلة (Nested)</h2>

      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <button onClick={addLayer} style={{ padding: '8px 16px', backgroundColor: '#004080', color: 'white', borderRadius: '6px', border: 'none' }}>
          ➕ إضافة طبقة داخلية
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
        {layers.map(layer => (
          <div key={layer.id} style={{ border: '1px solid #444', padding: '10px', borderRadius: '6px', minWidth: '300px' }}>
            <strong>{layer.name}</strong>
            <div style={{ marginTop: '5px' }}>
              <button onClick={() => rotateLayer(layer.id, 15)}>🔁 +15°</button>
              <button onClick={() => rotateLayer(layer.id, -15)} style={{ marginLeft: '5px' }}>↩️ -15°</button>
              <button onClick={() => toggleLayer(layer.id)} style={{ marginLeft: '5px' }}>
                {layer.visible ? '👁️ إخفاء' : '✅ عرض'}
              </button>
              <button onClick={() => removeLayer(layer.id)} style={{ marginLeft: '5px', color: 'red' }}>🗑️ حذف</button>
            </div>
            <hr />
            {layer.labels.map((label, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                <input value={label.text} onChange={e => updateLabel(layer.id, idx, 'text', e.target.value)} />
                <input type="number" value={label.angle} onChange={e => updateLabel(layer.id, idx, 'angle', parseFloat(e.target.value))} />
                <input type="color" value={label.color} onChange={e => updateLabel(layer.id, idx, 'color', e.target.value)} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <svg width={600} height={600} style={{ backgroundColor: '#000', border: '1px solid #444' }}>
        {/* رسم جميع الطبقات داخل نفس المركز */}
        {layers.map((layer, idx) => {
          if (!layer.visible) return null;
          const r = layer.radius;
          return (
            <g key={idx}>
              <circle cx={center.x} cy={center.y} r={r} stroke="#FFD700" strokeWidth="1" fill="none" />
              {layer.labels.map((label, i) => {
                const angle = ((label.angle + layer.rotation) % 360) * Math.PI / 180;
                const x = center.x + r * Math.cos(angle);
                const y = center.y + r * Math.sin(angle);
                return (
                  <text
                    key={i}
                    x={x}
                    y={y}
                    fill={label.color}
                    fontSize="14"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {label.text}
                  </text>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default GannWheelNestedLayers;
