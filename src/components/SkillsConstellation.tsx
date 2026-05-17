"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

type SkillNode = {
  id: string;
  name: string;
  category: string;
  desc: string;
  pos: [number, number, number];
};

const SKILLS_DATA: SkillNode[] = [
  { id: "react", name: "React 19", category: "Frontend", desc: "Expertise in the latest React 19 capabilities, concurrent rendering, and server components.", pos: [2.5, 1.5, 0.5] },
  { id: "next", name: "Next.js 16", category: "Frontend", desc: "Building highly-performant, SEO-optimized, Edge-ready full stack web applications.", pos: [-1.5, 2.5, 1.2] },
  { id: "three", name: "Three.js / WebGL", category: "3D Graphics", desc: "Immersive 3D graphics, customized WebGL renderers, shaders, and complex animations.", pos: [0, -3.2, 0.8] },
  { id: "r3f", name: "R3 Fiber", category: "3D Graphics", desc: "Declarative 3D scenes in React using R3F and drei for maximum modularity.", pos: [2.8, -1.2, -1.5] },
  { id: "gsap", name: "GSAP / Scroll", category: "Animations", desc: "Advanced scroll-triggered animations, stagger arrays, and complex timeline orchestrations.", pos: [-2.8, -1.8, 1.5] },
  { id: "framer", name: "Framer Motion", category: "Animations", desc: "Sleek micro-interactions, layout transitions, and high-quality UI morphing effects.", pos: [-3, 1, -1] },
  { id: "tailwind", name: "TailwindCSS v4", category: "Styling", desc: "Modern, lighting-fast styling utilizing css-variables, utility layers, and fluid grids.", pos: [1, 3.2, -0.5] },
  { id: "ts", name: "TypeScript", category: "Core", desc: "Type-safe development with scalable structures, strict checks, and advanced utility mapping.", pos: [-1.2, -0.5, -2.8] },
  { id: "node", name: "Node.js", category: "Backend", desc: "Scalable backend architectures, RESTful APIs, WebSockets, and database orchestrations.", pos: [1.8, -2, 2.4] },
  { id: "supabase", name: "Supabase / SQL", category: "Backend", desc: "Real-time databases, secure Row Level Security (RLS), edge functions, and OAuth flows.", pos: [-2.2, 2, -2.4] },
  { id: "ai", name: "AI / LLM APIs", category: "Intelligence", desc: "Integrating advanced LLMs (Gemini, Claude, OpenAI) into workflows with custom agents.", pos: [0.5, 0.8, 3.2] },
  { id: "performance", name: "Perf Audit", category: "Optimization", desc: "Optimizing frame-rates, bundle size reduction, deferring assets, and high-speed loading.", pos: [-0.5, -2.2, -2.6] },
];

function ConstellationGroup({
  onHoverSkill,
  activeSkillId,
}: {
  onHoverSkill: (skill: SkillNode | null) => void;
  activeSkillId: string | null;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Slowly rotate the constellation in gravity-defying float
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const elapsed = clock.getElapsedTime();
      groupRef.current.rotation.y = elapsed * 0.08;
      groupRef.current.rotation.x = Math.sin(elapsed * 0.05) * 0.05;
    }
  });

  // Calculate connection lines between nearby skills in 3D space
  const connectionLines = useMemo(() => {
    const lines: [THREE.Vector3, THREE.Vector3][] = [];
    const maxDist = 4.2;

    for (let i = 0; i < SKILLS_DATA.length; i++) {
      const p1 = new THREE.Vector3(...SKILLS_DATA[i].pos);
      for (let j = i + 1; j < SKILLS_DATA.length; j++) {
        const p2 = new THREE.Vector3(...SKILLS_DATA[j].pos);
        if (p1.distanceTo(p2) < maxDist) {
          lines.push([p1, p2]);
        }
      }
    }
    return lines;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Dynamic line connections */}
      {connectionLines.map(([p1, p2], idx) => {
        const points = [p1, p2];
        const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: "#00A86B",
          opacity: 0.12,
          transparent: true,
        });
        const lineMesh = new THREE.Line(lineGeom, lineMat);
        return <primitive key={idx} object={lineMesh} />;
      })}

      {/* Renders each skill node */}
      {SKILLS_DATA.map((skill) => {
        const isActive = activeSkillId === skill.id;
        return (
          <SkillNodePoint
            key={skill.id}
            skill={skill}
            isActive={isActive}
            onHoverSkill={onHoverSkill}
          />
        );
      })}

      {/* Core glowing center star */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#00A86B" opacity={0.3} transparent />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color="#9b51e0" opacity={0.1} transparent />
      </mesh>
    </group>
  );
}

function SkillNodePoint({
  skill,
  isActive,
  onHoverSkill,
}: {
  skill: SkillNode;
  isActive: boolean;
  onHoverSkill: (skill: SkillNode | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Slowly rotate and float individual nodes slightly
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const elapsed = clock.getElapsedTime();
      meshRef.current.position.y = skill.pos[1] + Math.sin(elapsed * 1.5 + skill.pos[0]) * 0.12;
    }
  });

  const nodeScale = isActive ? 1.6 : hovered ? 1.3 : 1;
  const nodeColor = isActive ? "#9b51e0" : hovered ? "#00A86B" : "#0F172A";

  return (
    <mesh
      ref={meshRef}
      position={skill.pos}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHoverSkill(skill);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHoverSkill(null);
      }}
    >
      <sphereGeometry args={[isActive ? 0.18 : 0.12, 16, 16]} />
      <meshStandardMaterial
        color={nodeColor}
        emissive={nodeColor}
        emissiveIntensity={isActive ? 2 : hovered ? 1.2 : 0.2}
        roughness={0.1}
        metalness={0.9}
      />

      {/* Subtle outer shell glow */}
      {(hovered || isActive) && (
        <mesh scale={[nodeScale * 1.8, nodeScale * 1.8, nodeScale * 1.8]}>
          <sphereGeometry args={[isActive ? 0.18 : 0.12, 8, 8]} />
          <meshBasicMaterial
            color={isActive ? "#9b51e0" : "#00A86B"}
            opacity={0.18}
            transparent
            wireframe
          />
        </mesh>
      )}

      {/* Floating text label using HTML with glassmorphic styling */}
      <Html
        distanceFactor={6}
        position={[0, 0.35, 0]}
        center
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            background: isActive
              ? "linear-gradient(135deg, rgba(155, 81, 224, 0.1), rgba(255, 255, 255, 0.95))"
              : hovered
              ? "linear-gradient(135deg, rgba(0, 168, 107, 0.1), rgba(255, 255, 255, 0.95))"
              : "rgba(255, 255, 255, 0.85)",
            border: `1px solid ${
              isActive
                ? "rgba(155, 81, 224, 0.3)"
                : hovered
                ? "rgba(0, 168, 107, 0.3)"
                : "rgba(15, 23, 42, 0.08)"
            }`,
            color: isActive ? "#9b51e0" : hovered ? "#00A86B" : "#0F172A",
            padding: "4px 8px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: hovered || isActive ? 700 : 500,
            whiteSpace: "nowrap",
            backdropFilter: "blur(4px)",
            boxShadow: hovered || isActive ? "0 4px 12px rgba(15, 23, 42, 0.08)" : "none",
            transform: hovered || isActive ? "scale(1.08)" : "scale(1)",
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {skill.name}
        </div>
      </Html>
    </mesh>
  );
}

export default function SkillsConstellation() {
  const [activeSkill, setActiveSkill] = useState<SkillNode | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Guard to ensure client-side rendering (WebGL is browser-only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-transparent">
        <div className="text-gray-400 text-sm animate-pulse">Loading 3D Galaxy Constellation...</div>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      {/* 3D Canvas side (8 columns on wide screen) */}
      <div className="lg:col-span-7 h-[420px] rounded-3xl overflow-hidden border border-slate-900/5 bg-[#ffffff]/60 backdrop-blur-md relative shadow-sm">
        {/* Glow indicator */}
        <div className="absolute top-4 left-4 z-10 text-xs font-bold text-slate-500 flex items-center gap-2 select-none">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00A86B] animate-ping" />
          INTERACTIVE 3D GALAXY (DRAG TO ROTATE / HOVER TO FOCUS)
        </div>

        <Canvas camera={{ position: [0, 0, 8.5], fov: 50 }}>
          <ambientLight intensity={0.45} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#00A86B" />
          <pointLight position={[-10, -10, -10]} intensity={1.2} color="#9b51e0" />
          
          <ConstellationGroup
            onHoverSkill={setActiveSkill}
            activeSkillId={activeSkill ? activeSkill.id : null}
          />
          
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={!activeSkill}
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={(Math.PI * 3) / 4}
          />
        </Canvas>
      </div>

      {/* Sleek description card side (5 columns on wide screen) */}
      <div className="lg:col-span-5 h-[420px] flex flex-col justify-center">
        <div className="glass-panel p-8 relative overflow-hidden h-full flex flex-col justify-between"
             style={{ background: "linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.5))" }}>
          {/* Subtle neon glowing gradient backing */}
          <div className="absolute -right-20 -bottom-20 w-48 h-48 rounded-full blur-[100px] opacity-15 pointer-events-none transition-all duration-700"
               style={{ background: activeSkill ? "var(--primary-hover)" : "var(--primary)" }} />

          {activeSkill ? (
            <div className="space-y-6 fade-in animate-fadeIn">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#00A86B] bg-[#00A86B]/10 px-3 py-1 rounded-full border border-[#00A86B]/20 select-none">
                  {activeSkill.category}
                </span>
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-slate-900 leading-tight glow-text-primary">
                  {activeSkill.name}
                </h3>
                <div className="w-12 h-1 bg-gradient-to-r from-[#00A86B] to-[#9b51e0] mt-3 rounded-full" />
              </div>
              <p className="text-slate-600 text-base leading-relaxed">
                {activeSkill.desc}
              </p>
            </div>
          ) : (
            <div className="space-y-6 flex flex-col justify-center h-full text-center lg:text-left select-none">
              <div className="w-16 h-16 rounded-full bg-slate-900/5 flex items-center justify-center mx-auto lg:mx-0 border border-slate-950/10">
                <svg className="w-8 h-8 text-[#00A86B] animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253m0 0L3 12m18 0l-3 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                  Constellation de Compétences
                </h3>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                  Survolez les nœuds stellaires de la galaxie interactive 3D pour explorer notre expertise technologique, nos frameworks favoris et nos méthodes d'optimisation.
                </p>
              </div>
            </div>
          )}

          {/* Action indicator link */}
          <div className="pt-6 border-t border-slate-950/5 flex items-center justify-between text-xs text-slate-500">
            <span>Powered by React Three Fiber</span>
            <span className="flex items-center gap-1">
              Interactive Mode <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
