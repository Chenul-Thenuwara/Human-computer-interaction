"use client";

import { useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from "@react-three/drei";
import { useDesign } from "@/lib/design-context";
import * as THREE from "three";
import { Card } from "@/components/ui/card";

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

export function Visualization3D() {
  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <Canvas shadows dpr={[1, 2]}>
        <SceneSetup />
        <Room />
      </Canvas>
      
      <div className="absolute bottom-4 right-4 backdrop-blur-md bg-card/50 p-3 rounded-lg border border-white/20 shadow-lg text-xs text-muted-foreground pointer-events-none">
        <p>Left Click: Rotate • Right Click: Pan • Scroll: Zoom</p>
      </div>
    </div>
  );
}
