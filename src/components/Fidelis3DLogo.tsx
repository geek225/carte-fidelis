"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";

function LogoMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Core sphere rotation
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.4;
      meshRef.current.rotation.x = time * 0.2;
    }

    // Rings orbital motion
    if (ringRef1.current) {
      ringRef1.current.rotation.x = time * 0.6;
      ringRef1.current.rotation.y = time * 0.3;
    }

    if (ringRef2.current) {
      ringRef2.current.rotation.y = -time * 0.5;
      ringRef2.current.rotation.z = time * 0.4;
    }
  });

  return (
    <group>
      {/* Central Branded Sphere */}
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshStandardMaterial 
          color="#00A86B" 
          roughness={0.1} 
          metalness={0.9} 
          wireframe={false}
        />
        {/* Floating Text engraved onto the sphere */}
        <Html transform distanceFactor={2.0} position={[0, 0, 1.05]}>
          <div style={{
            color: "#ffffff",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: "800",
            fontSize: "12px",
            background: "rgba(15,23,42,0.9)",
            padding: "4px 10px",
            borderRadius: "20px",
            border: "1px solid #00A86B",
            letterSpacing: "1px",
            whiteSpace: "nowrap"
          }}>
            FIDELIS
          </div>
        </Html>
      </mesh>

      {/* Orbital Gold Ring 1 */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[1.5, 0.05, 16, 100]} />
        <meshStandardMaterial 
          color="#D4AF37" 
          roughness={0.2} 
          metalness={1.0} 
        />
      </mesh>

      {/* Orbital Gold Ring 2 */}
      <mesh ref={ringRef2}>
        <torusGeometry args={[1.8, 0.03, 16, 100]} />
        <meshStandardMaterial 
          color="#9b51e0" 
          roughness={0.2} 
          metalness={0.9} 
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

export function Fidelis3DLogo() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div style={{ width: "100%", height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "radial-gradient(circle, #00A86B 0%, #0F172A 70%)" }} />
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "320px", cursor: "grab" }}>
      <Canvas 
        camera={{ position: [0, 0, 4.0], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 3, 5]} intensity={2.0} castShadow />
        <pointLight position={[-2, -2, 2]} intensity={0.5} />
        <Float speed={2.5} rotationIntensity={0.3} floatIntensity={0.6}>
          <LogoMesh />
        </Float>
      </Canvas>
    </div>
  );
}
