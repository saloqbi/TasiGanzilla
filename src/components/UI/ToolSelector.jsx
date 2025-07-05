
import React from 'react';
import { useTool } from '../../context/ToolContext';

const ToolSelector = () => {
  const { activeTool, setActiveTool } = useTool();

  const tools = [
    { label: 'GannBox', value: 'GannBox' },
    { label: 'GannFan', value: 'GannFan' },
    { label: 'GannGrid', value: 'GannGrid' },
    { label: 'GannSquare', value: 'GannSquare' },
    { label: 'GannSquareCustom', value: 'GannSquareCustom' },
    { label: 'GannSquare144', value: 'GannSquare144' }, // ✅ الجديد
  ];

  return (
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      {tools.map((tool) => (
        <button
          key={tool.value}
          onClick={() => setActiveTool(tool.value)}
          style={{
            margin: '0 5px',
            padding: '10px 15px',
            fontSize: '16px',
            backgroundColor: activeTool === tool.value ? '#ffcc00' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
};

export default ToolSelector;
