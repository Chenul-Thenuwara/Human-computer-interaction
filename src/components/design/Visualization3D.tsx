"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, useProgress } from "@react-three/drei";
import { useDesign } from "@/lib/design-context";
import * as THREE from "three";

import { Furniture3D } from "./Furniture3D";

function House() {
  const { currentDesign } = useDesign();
  
  if (!currentDesign || !currentDesign.rooms) return null;

  const buildWallShape = (wallWidth: number, wallHeight: number, features: any[], wallName: string, reversePosition: boolean) => {
    const shape = new THREE.Shape();
    shape.moveTo(-wallWidth / 2, -wallHeight / 2);
    shape.lineTo(wallWidth / 2, -wallHeight / 2);
    shape.lineTo(wallWidth / 2, wallHeight / 2);
    shape.lineTo(-wallWidth / 2, wallHeight / 2);
    shape.lineTo(-wallWidth / 2, -wallHeight / 2);

    if (features && features.length > 0) {
      features.filter(f => f.wall === wallName).forEach(f => {
        const hole = new THREE.Path();
        const localX = reversePosition ? (wallWidth / 2 - f.position) : (-wallWidth / 2 + f.position);
        const bottom = -wallHeight / 2 + (f.elevation || 0);
        const hw = f.width / 2;

        hole.moveTo(localX - hw, bottom);
        hole.lineTo(localX + hw, bottom);
        hole.lineTo(localX + hw, bottom + f.height);
        hole.lineTo(localX - hw, bottom + f.height);
        hole.lineTo(localX - hw, bottom);

        shape.holes.push(hole);
      });
    }
    return shape;
  };

  return (
    <group>
      {currentDesign.rooms.map(roomData => {
        const { width, length, height, wallColor, floorColor, position } = roomData.room;
        
        // Convert the 2D position (top-left of the room in 2D space) to 3D position
        // In 2D, coordinates grow right (X) and down (Z)
        // Let's center the whole house around 0,0, but for now just map local positions
        // x is center of the room in X: position.x + width / 2
        // z is center of the room in Z: position.z + length / 2
        const roomX = (position?.x || 0) + width / 2;
        const roomZ = (position?.z || 0) + length / 2;
        
        // Materials specific to this room
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
          <group key={roomData.id} position={[roomX, 0, roomZ]}>
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
            {roomData.furniture.map((item) => {
              if (!item.position) return null;
              // 2D position is relative to this room's top-left corner
              const localX = item.position.x - width / 2;
              const localZ = item.position.y - length / 2;
              
              return (
                <group key={item.id} position={[localX, 0, localZ]}>
                  <Furniture3D item={item} />
                </group>
              );
            })}

            {/* Front Wall (Top in 2D, mapped to -Z) */}
            <mesh 
              position={[0, height / 2, -length / 2]} 
              receiveShadow 
              castShadow
            >
              <shapeGeometry args={[buildWallShape(width, height, roomData.room.features || [], 'front', false)]} />
              <primitive object={wallMaterial} attach="material" />
            </mesh>

            {/* Back Wall (Bottom in 2D, mapped to +Z) */}
            <mesh 
              position={[0, height / 2, length / 2]} 
              rotation={[0, Math.PI, 0]}
              receiveShadow 
              castShadow
            >
              <shapeGeometry args={[buildWallShape(width, height, roomData.room.features || [], 'back', true)]} />
              <primitive object={wallMaterial} attach="material" />
            </mesh>

            {/* Left Wall */}
            <mesh 
              position={[-width / 2, height / 2, 0]} 
              rotation={[0, Math.PI / 2, 0]}
              receiveShadow 
              castShadow
            >
              <shapeGeometry args={[buildWallShape(length, height, roomData.room.features || [], 'left', true)]} />
              <primitive object={wallMaterial} attach="material" />
            </mesh>

            {/* Right Wall */}
            <mesh 
              position={[width / 2, height / 2, 0]} 
              rotation={[0, -Math.PI / 2, 0]}
              receiveShadow 
              castShadow
            >
              <shapeGeometry args={[buildWallShape(length, height, roomData.room.features || [], 'right', false)]} />
              <primitive object={wallMaterial} attach="material" />
            </mesh>
          </group>
        );
      })}
      
      {/* Grid Helper covering roughly a 50x50m area */}
      <gridHelper args={[50, 50, 0x000000, 0xcccccc]} position={[20, 0.01, 20]} />
    </group>
  );
}

function SceneSetup() {
  const { currentDesign } = useDesign();
  // Calculate bounding box center
  let minX = 0, minY = 0, maxX = 10, maxY = 10;
  if (currentDesign && currentDesign.rooms) {
    currentDesign.rooms.forEach(r => {
      const rx = r.room.position?.x || 0;
      const rz = r.room.position?.z || 0;
      minX = Math.min(minX, rx);
      minY = Math.min(minY, rz);
      maxX = Math.max(maxX, rx + r.room.width);
      maxY = Math.max(maxY, rz + r.room.length);
    });
  }
  
  const width = maxX - minX;
  const length = maxY - minY;
  const size = Math.max(width, length, 15);
  const centerX = minX + width / 2;
  const centerZ = minY + length / 2;
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[centerX + size * 0.75, size * 0.75, centerZ + size * 0.75]} fov={50} />
      <OrbitControls makeDefault target={[centerX, 0, centerZ]} minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
      
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[centerX + 5, 20, centerZ + 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
        shadow-camera-left={-size}
        shadow-camera-right={size}
        shadow-camera-top={size}
        shadow-camera-bottom={-size}
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
          <House />
        </Suspense>
      </Canvas>
      <CustomLoader />
      
      <div className="absolute bottom-4 right-4 backdrop-blur-md bg-card/50 p-3 rounded-lg border border-white/20 shadow-lg text-xs text-muted-foreground pointer-events-none z-10">
        <p>Left Click: Rotate • Right Click: Pan • Scroll: Zoom</p>
      </div>
    </div>
  );
}
