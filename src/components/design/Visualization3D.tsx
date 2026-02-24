"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, useProgress } from "@react-three/drei";
import { useDesign } from "@/lib/design-context";
import * as THREE from "three";

import { Furniture3D } from "./Furniture3D";

function Room() {
  const { currentDesign } = useDesign();
  
  if (!currentDesign) return null;
  
  const { width, length, height, wallColor, floorColor } = currentDesign.room;
  
  // Create materials
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: floorColor,
    roughness: 0.8,
    metalness: 0.1
  });
  
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: wallColor,
    roughness: 0.9,
    metalness: 0.05,
    side: THREE.DoubleSide
  });

  return (
    <group>
      {/* Floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[width, length]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      {/* Furniture */}
      {currentDesign.furniture.map((item) => {
        if (!item.position) return null;
        // Calculate 3D position centering
        // item.position.x is from top-left (0,0) to right.
        // item.position.y is from top-left (0,0) to down.
        // Room center is (0,0) in 3D.
        // 2D X range: [0, width] -> 3D X range: [-width/2, width/2]
        // 2D Y range: [0, length] -> 3D Z range: [-length/2, length/2]
        
        const x = item.position.x - width / 2;
        const z = item.position.y - length / 2;
        
        return (
          <group key={item.id} position={[x, 0, z]}>
            <Furniture3D item={item} />
          </group>
        );
      })}

      {/* Back Wall (along Width) */}
      <mesh 
        position={[0, height / 2, -length / 2]} 
        receiveShadow 
        castShadow
      >
        <planeGeometry args={[width, height]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* Front Wall (along Width) */}
      <mesh 
        position={[0, height / 2, length / 2]} 
        rotation={[0, Math.PI, 0]}
        receiveShadow 
        castShadow
      >
        <planeGeometry args={[width, height]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* Left Wall (along Length) */}
      <mesh 
        position={[-width / 2, height / 2, 0]} 
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow 
        castShadow
      >
        <planeGeometry args={[length, height]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* Right Wall (along Length) */}
      <mesh 
        position={[width / 2, height / 2, 0]} 
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow 
        castShadow
      >
        <planeGeometry args={[length, height]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* Grid Helper for scale reference */}
      <gridHelper args={[Math.max(width, length) + 4, Math.max(width, length) + 4, 0x000000, 0xcccccc]} position={[0, 0.01, 0]} />
    </group>
  );
}

function SceneSetup() {
  const { currentDesign } = useDesign();
  // Adjust camera based on room size
  const size = Math.max(currentDesign?.room.width || 5, currentDesign?.room.length || 5);
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[size * 0.75, size * 0.75, size * 0.75]} fov={50} />
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
      
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024} 
      />
      <Environment preset="apartment" />
    </>
  );
}

export function CustomLoader() {
  const { active, progress, item, loaded, total } = useProgress();

  if (!active) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0f0d]/80 backdrop-blur-xl transition-opacity duration-300">
      <div className="relative flex flex-col items-center max-w-sm w-full p-8 rounded-3xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden">
        {/* Animated geometric background elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#f3b5a1]/20 rounded-full blur-3xl animate-pulse translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8ea37e]/20 rounded-full blur-3xl animate-pulse -translate-x-1/4 translate-y-1/4" style={{ animationDelay: "1s" }} />

        {/* 3D App Icon or Logo Placeholder */}
        <div className="relative z-10 w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br from-[#233529] to-[#8ea37e] border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(142,163,126,0.3)] animate-bounce">
          <svg className="w-10 h-10 text-[#f3b5a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
        </div>

        {/* Text Details */}
        <div className="relative z-10 w-full text-center">
          <h3 className="text-2xl font-medium text-white mb-2 tracking-wide" style={{ fontFamily: "var(--font-italiana)" }}>
            Constructing Room
          </h3>
          <p className="text-xs font-light text-white/50 mb-6 h-4 truncate">
            {item ? `Loading ${item.split('/').pop()}` : 'Preparing environment...'}
          </p>

          {/* Progress Bar Container */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-[#8ea37e] via-[#f3b5a1] to-[#8ea37e] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] font-medium tracking-wider uppercase">
            <span className="text-[#f3b5a1]">{Math.round(progress)}%</span>
            <span className="text-white/40">{loaded} / {total || 1} models</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Visualization3D() {
  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          <SceneSetup />
          <Room />
        </Suspense>
      </Canvas>
      <CustomLoader />
      
      <div className="absolute bottom-4 right-4 backdrop-blur-md bg-card/50 p-3 rounded-lg border border-white/20 shadow-lg text-xs text-muted-foreground pointer-events-none z-10">
        <p>Left Click: Rotate • Right Click: Pan • Scroll: Zoom</p>
      </div>
    </div>
  );
}
