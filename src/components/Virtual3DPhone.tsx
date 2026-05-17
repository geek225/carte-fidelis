"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";

function PhoneScene() {
  const phoneRef = useRef<THREE.Group>(null);
  const cardRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!phoneRef.current || !cardRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Slow rotational spinning
    phoneRef.current.rotation.y = Math.sin(time * 0.3) * 0.3;
    phoneRef.current.rotation.x = 0.1 + Math.cos(time * 0.3) * 0.05;

    // Counter float for the virtual card
    cardRef.current.position.z = 0.45 + Math.sin(time * 1.5) * 0.05;
    cardRef.current.rotation.y = Math.sin(time * 0.8) * 0.1;
  });

  return (
    <group>
      {/* Smartphone frame */}
      <group ref={phoneRef}>
        <mesh castShadow>
          <boxGeometry args={[1.8, 3.6, 0.12]} />
          <meshStandardMaterial 
            color="#0F172A" 
            roughness={0.1} 
            metalness={0.9} 
          />
        </mesh>

        {/* Outer bezel rim */}
        <mesh position={[0, 0, 0.015]}>
          <boxGeometry args={[1.72, 3.52, 0.1]} />
          <meshStandardMaterial 
            color="#020306" 
            roughness={0.2} 
            metalness={0.9} 
          />
        </mesh>

        {/* Screen with CSS Projected App preview */}
        <Html 
          transform 
          distanceFactor={2.5} 
          position={[0, 0, 0.065]}
          occlude="blending"
        >
          <div style={{
            width: "165px",
            height: "340px",
            background: "linear-gradient(135deg, #0F172A, #050814)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "18px",
            overflow: "hidden",
            color: "#ffffff",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "16px",
            boxShadow: "inset 0 0 15px rgba(0, 168, 107, 0.3)",
            userSelect: "none",
            pointerEvents: "none"
          }}>
            {/* Top Speaker/Notch */}
            <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "-8px 0 8px 0" }}>
              <div style={{ width: "45px", height: "4px", background: "#0F172A", borderRadius: "10px" }} />
            </div>

            {/* App Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "10px", fontWeight: "700", color: "#00A86B" }}>FIDELIS APP</span>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00A86B" }} />
            </div>

            {/* App body */}
            <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "8px", margin: "16px 0" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", textAlign: "center", color: "#ffffff" }}>
                Solde Privilège
              </div>
              <div style={{ fontSize: "20px", fontWeight: "800", textAlign: "center", color: "#00A86B" }}>
                35 420 pts
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "8px", fontSize: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Abidjan Mall</span>
                  <span style={{ color: "#00A86B" }}>+250 pts</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Logis Prestige</span>
                  <span style={{ color: "#00A86B" }}>+1200 pts</span>
                </div>
              </div>
            </div>

            {/* App footer logo */}
            <div style={{ textAlign: "center", fontSize: "7px", opacity: 0.5, letterSpacing: "1px" }}>
              SOUMANGOUROU TECH
            </div>
          </div>
        </Html>
      </group>

      {/* Floating Virtuelle Card projecting in front of phone screen */}
      <group ref={cardRef} position={[0, 0, 0.45]}>
        <mesh>
          <boxGeometry args={[1.5, 0.95, 0.02]} />
          <meshStandardMaterial 
            color="#00A86B" 
            transparent 
            opacity={0.4} 
            roughness={0.1} 
            metalness={0.9} 
          />
        </mesh>
        
        <Html 
          transform 
          distanceFactor={2.5} 
          position={[0, 0, 0.015]}
        >
          <div style={{
            width: "150px",
            height: "95px",
            background: "linear-gradient(135deg, rgba(0, 168, 107, 0.8), rgba(15, 23, 42, 0.95))",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            padding: "10px",
            color: "#ffffff",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            userSelect: "none",
            pointerEvents: "none"
          }}>
            <div style={{ fontSize: "8px", fontWeight: "700", letterSpacing: "0.5px" }}>VIRTUELLE FIDELIS</div>
            <div style={{ fontSize: "14px", fontWeight: "800", color: "#00A86B" }}>$ VALIDE</div>
            <div style={{ fontSize: "7px", fontFamily: "monospace", opacity: 0.8 }}>4321 **** **** 9876</div>
          </div>
        </Html>
      </group>
    </group>
  );
}

export function Virtual3DPhone() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div style={{ width: "100%", height: "300px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.02)", borderRadius: "24px" }}>
        <div style={{ width: "130px", height: "260px", background: "linear-gradient(135deg, #0F172A, #050814)", border: "2px solid #00A86B", borderRadius: "18px" }} />
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "300px", cursor: "grab" }}>
      <Canvas 
        camera={{ position: [0, 0, 3.8], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1.6} />
        <directionalLight position={[3, 3, 5]} intensity={2.0} castShadow />
        <pointLight position={[-2, -2, 2]} intensity={0.6} />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.8}>
          <PhoneScene />
        </Float>
      </Canvas>
    </div>
  );
}
