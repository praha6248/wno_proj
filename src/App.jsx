import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, SoftShadows } from '@react-three/drei';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';
import PhysicsScene from './PhysicsScene.jsx';
import UI from './UI';

export const MATERIALS = {
  Stal: { friction: 0.4, restitution: 0.3, density: 7500.0, color: 'rgba(121, 121, 121, 1)', radius: 1.0 },
  Guma: { friction: 0.9, restitution: 0.9, density: 1300.0, color: '#ff3333', radius: 0.5 },
  Styropian: { friction: 0.5, restitution: 0.1, density: 20.0, color: '#ffffff', radius: 1.5 },

};

export const GRAVITY_OPTIONS = [
  { label: "Ziemia (-9.81)", value: [0, -9.81, 0] },
  { label: "Księżyc (-1.62)", value: [0, -1.62, 0] },
  { label: "Mars (-3.73)", value: [0, -3.73, 0] },
  { label: "Słońce (-274.0)", value: [0, -274.0, 0] },
];

export default function App() {
  const [gravity, setGravity] = useState([0, -9.81, 0]);
  const ballsRef = useRef([]); 
  
  const spawnBall = (materialKey) => {
    const mat = MATERIALS[materialKey];
    const randX = (Math.random() - 0.5) * 4.0;
    const randZ = (Math.random() - 0.5) * 4.0;
    
    const volume = (4.0 / 3.0) * Math.PI * Math.pow(mat.radius, 3);
    const mass = volume * mat.density;

    const newBall = {
      id: uuidv4(),
      position: new THREE.Vector3(randX, 15.0, randZ),
      velocity: new THREE.Vector3(0, 0, 0),
      radius: mat.radius,
      mass: mass,
      material: { 
        friction: mat.friction, 
        restitution: mat.restitution, 
        density: mat.density 
      }, 
      color: mat.color,
      mesh: null 
    };

    ballsRef.current.push(newBall);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#111' }}>
      <UI 
        spawnBall={spawnBall} 
        setGravity={setGravity} 
        currentGravity={gravity} 
        materials={MATERIALS}
        gravityOptions={GRAVITY_OPTIONS}
      />
      <Canvas camera={{ position: [0, 10, 20], fov: 50 }} shadows>
        <color attach="background" args={['#000']} />
        
        <SoftShadows size={15} samples={16} focus={0.5} />
        
        <hemisphereLight 
          skyColor="#ffffff" 
          groundColor="#444444" 
          intensity={0.5} 
        />
        
        <directionalLight 
          position={[10, 15, 10]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        >
          <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
        </directionalLight>

        <OrbitControls makeDefault />

        <PhysicsScene ballsRef={ballsRef} gravity={gravity} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0,0,0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      </Canvas>
    </div>
  );
}