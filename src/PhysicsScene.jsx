import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';

const wektor_normalny = new THREE.Vector3();
const v_wzgledna = new THREE.Vector3();


export default function PhysicsScene({ ballsRef, gravity }) {
  const [_, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const rozbicie = (ball, ballsArray) => {
    if (ball.radius < 0.2) return;
    const nowy_r = ball.radius / 1.5; 
    const nowa_m = ball.mass / 3.0;
    for (let i = 0; i < 3; i++) {
      ballsArray.push({
        id: uuidv4(),
        position: ball.position.clone().add(
            new THREE.Vector3(
                (Math.random() - 0.5) * ball.radius, 
                (Math.random() - 0.5) * ball.radius, 
                (Math.random() - 0.5) * ball.radius
            )
        ),
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 8, 
            Math.random() * 5 + 2, 
            (Math.random() - 0.5) * 8
        ),
        radius: nowy_r,
        mass: nowa_m,
        material: ball.material, 
        color: ball.color,
        mesh: null
      });
    }
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (ballsRef.current.length !== meshRefs.current.length) {
        forceUpdate();
      }
    }, 100);
    return () => clearInterval(interval);
  });

  const meshRefs = useRef([]);

  useFrame(() => {
    let balls = ballsRef.current;
    const ballsToRemove = new Set();
    const dt = 0.016; 
    const gravityVec = new THREE.Vector3(...gravity);

    balls.forEach(ball => {
      ball.velocity.addScaledVector(gravityVec, dt);
      ball.position.addScaledVector(ball.velocity, dt);
    });
    balls.forEach(ball => {
      if (ball.position.y < ball.radius) {
        ball.position.y = ball.radius;

        if (ball.velocity.y < 0) {
           const impactSpeed = Math.abs(ball.velocity.y);
           if (ball.material.density < 100 && impactSpeed > 12.0) {
              ballsToRemove.add(ball.id);
              rozbicie(ball, balls);
           } 
           else {
              const combinedRestitution = (ball.material.restitution + 0.5) / 2.0;
              ball.velocity.y *= -combinedRestitution;
              const frictionFactor = (ball.material.friction + 0.9) / 2.0;
              let hamowanie = Math.max(0.0, 1.0 - frictionFactor * 0.1);
              ball.velocity.x *= hamowanie;
              ball.velocity.z *= hamowanie;
           }
        }
      }
    });

    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const b1 = balls[i];
        const b2 = balls[j];

        if (ballsToRemove.has(b1.id) || ballsToRemove.has(b2.id)) continue;

        const dist_sqr = b1.position.distanceToSquared(b2.position);
        const suma_r = b1.radius + b2.radius;

        if (dist_sqr < suma_r * suma_r) {
          const dist = Math.sqrt(dist_sqr);
          wektor_normalny.subVectors(b2.position, b1.position).divideScalar(dist);
          const nachodza = suma_r - dist;
          
          const inv_m1 = 1.0 / b1.mass;
          const inv_m2 = 1.0 / b2.mass;
          const sum_inv_m = inv_m1 + inv_m2;
          
          if (sum_inv_m > 0) {
              const move = wektor_normalny.clone().multiplyScalar(nachodza / sum_inv_m);
              b1.position.sub(move.clone().multiplyScalar(inv_m1));
              b2.position.add(move.clone().multiplyScalar(inv_m2));
          }
          v_wzgledna.subVectors(b2.velocity, b1.velocity);
          const v_kolizji = v_wzgledna.length(); 
          let rozsypywanie = false;
          
          if (v_kolizji > 12.0) {
             if (b1.material.density < 100) { 
                ballsToRemove.add(b1.id);
                rozbicie(b1, balls);
                rozsypywanie = true;
             }
             if (b2.material.density < 100) {
                ballsToRemove.add(b2.id);
                rozbicie(b2, balls);
                rozsypywanie = true;
             }
          }
          if (!rozsypywanie) {
             const v_po_normalnej = v_wzgledna.dot(wektor_normalny);
             if (v_po_normalnej < 0) {
                 const rest = (b1.material.restitution + b2.material.restitution) / 2.0;
                 const j = (-(1.0 + rest) * v_po_normalnej) / sum_inv_m;
                 const impuls = wektor_normalny.clone().multiplyScalar(j);
                 b1.velocity.sub(impuls.clone().multiplyScalar(inv_m1));
                 b2.velocity.add(impuls.clone().multiplyScalar(inv_m2));
             }
          }
        }
      }
    }

    if (ballsToRemove.size > 0) {
      ballsRef.current = balls.filter(b => !ballsToRemove.has(b.id));
      meshRefs.current = []; 
      forceUpdate();
    }

    ballsRef.current.forEach((ball, index) => {
      if (meshRefs.current[index]) {
        meshRefs.current[index].position.copy(ball.position);
      }
    });
  });

  return (
    <>
      {ballsRef.current.map((ball, index) => (
        <mesh 
          key={ball.id} 
          ref={el => meshRefs.current[index] = el}
          castShadow 
          receiveShadow
          position={ball.position} 
        >
          <sphereGeometry args={[ball.radius, 32, 32]} />
          <meshStandardMaterial color={ball.color} />
        </mesh>
      ))}
    </>
  );
}