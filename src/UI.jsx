import React from 'react';

const panelStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '220px',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  padding: '10px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  color: 'white',
  fontFamily: 'monospace',
  zIndex: 10,
};

const buttonStyle = (isActive) => ({
  width: '100%',
  height: '40px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: isActive ? '#4CAF50' : '#333344',
  border: '1px solid #555',
  color: isActive ? 'white' : '#ddd',
  cursor: 'pointer',
  fontSize: '14px',
});

const headerStyle = {
  fontSize: '20px',
  marginBottom: '5px',
  marginTop: '10px',
  fontWeight: 'bold'
};

export default function UI({ spawnBall, setGravity, currentGravity, materials, gravityOptions }) {
  
  const isGravityActive = (val) => {
    return val[0]===currentGravity[0]&&val[1]===currentGravity[1]&&val[2]===currentGravity[2];
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>Wygeneruj materiał</div>
      {Object.keys(materials).map((key) => {
         const mat = materials[key];
         return (
            <button 
              key={key} 
              style={{
                ...buttonStyle(false),
                backgroundColor: '#333',
                color: mat.color
              }}
              onClick={() => spawnBall(key)}
            >
              {key} ({mat.radius})
            </button>
         )
      })}

      <div style={{ height: '20px' }}></div>

      <div style={headerStyle}>Grawitacja</div>
      {gravityOptions.map((opt) => (
        <button
          key={opt.label}
          style={buttonStyle(isGravityActive(opt.value))}
          onClick={() => {
            setGravity(opt.value);
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}