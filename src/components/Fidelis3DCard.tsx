"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

function CardMesh() {
  const groupRef = useRef<THREE.Group>(null);
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0 });

  // Handle subtle auto-rotation and interactive mouse tracking
  useFrame((state) => {
    if (!groupRef.current) return;

    // Standard floating rotation
    const time = state.clock.getElapsedTime();
    const autoX = Math.sin(time * 0.5) * 0.1;
    const autoY = Math.cos(time * 0.5) * 0.15;

    // Smooth interpolation (lerp) towards target mouse rotation + floating auto-rotation
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotation.x + autoX,
      0.1
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotation.y + autoY,
      0.1
    );

    // Floating position
    groupRef.current.position.y = Math.sin(time * 1.5) * 0.08;
  });

  const handlePointerMove = (e: any) => {
    // Map mouse position within canvas (-0.5 to 0.5) to a subtle rotation tilt
    const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
    const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;
    setTargetRotation({
      x: -y * 0.8,
      y: x * 0.8
    });
  };

  const handlePointerLeave = () => {
    setTargetRotation({ x: 0, y: 0 });
  };

  useEffect(() => {
    window.addEventListener("mousemove", handlePointerMove);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
    };
  }, []);

  return (
    <group ref={groupRef} onPointerLeave={handlePointerLeave}>
      {/* 3D Card Thickness box */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.4, 2.15, 0.06]} />
        <meshStandardMaterial 
          color="#0F172A" 
          roughness={0.2} 
          metalness={0.9} 
        />
      </mesh>

      {/* Front Face with Golden border and premium HTML transform layer */}
      <Html 
        transform 
        distanceFactor={3} 
        position={[0, 0, 0.035]}
        occlude="blending"
      >
        <div style={{
          width: "340px",
          height: "215px",
          background: "linear-gradient(135deg, #1E293B, #0F172A)",
          border: "2px solid #00A86B",
          borderRadius: "16px",
          padding: "24px",
          color: "#ffffff",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "inset 0 0 25px rgba(0, 168, 107, 0.15), 0 20px 40px rgba(0,0,0,0.3)",
          userSelect: "none",
          pointerEvents: "none"
        }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#00A86B", letterSpacing: "1px", textTransform: "uppercase" }}>
              FIDELIS CARD
            </span>
            {/* Gold metallic SIM chip */}
            <div style={{
              width: "40px",
              height: "30px",
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.2)"
            }} />
          </div>

          {/* Body */}
          <div style={{ marginTop: "10px" }}>
            <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Points Cumulés
            </div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.5px" }}>
              12,450 PTS
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "8px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Numéro Adhérent
              </div>
              <div style={{ fontSize: "12px", fontFamily: "monospace", color: "rgba(255,255,255,0.85)" }}>
                4321 8654 **** 6547
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "8px", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Valide
              </div>
              <div style={{ fontSize: "12px", color: "#00A86B", fontWeight: "700" }}>
                08/28
              </div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

export function Fidelis3DCard() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div style={{ width: "100%", height: "300px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.02)", borderRadius: "24px" }}>
        <div style={{ width: "300px", height: "190px", background: "linear-gradient(135deg, #1E293B, #0F172A)", border: "2px solid #00A86B", borderRadius: "16px" }} />
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "300px", cursor: "grab" }}>
      <Canvas 
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[2, 2, 5]} intensity={1.8} castShadow />
        <pointLight position={[-2, -2, 2]} intensity={0.5} />
        <CardMesh />
      </Canvas>
    </div>
  );
}
