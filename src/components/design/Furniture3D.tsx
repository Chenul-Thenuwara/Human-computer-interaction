"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { FurnitureItem } from "@/lib/design-context";

interface Furniture3DProps {
  item: FurnitureItem;
}

export function Furniture3D({ item }: Furniture3DProps) {
  const { type, width, depth, height, color, modelUrl, rotation = 0 } = item;

  // Convert material (for procedural fallback)
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.1,
    });
  }, [color]);

  const renderContent = () => {
    if (modelUrl) {
      return (
        <ModelLoader 
          url={modelUrl} 
          width={width} 
          height={height} 
          depth={depth} 
        />
      );
    }

    // Fallback to procedural geometry
    switch (type) {
      case 'chair':
        return <ChairGeometry width={width} depth={depth} height={height} material={material} />;
      case 'dining-table':
      case 'side-table':
        return <TableGeometry width={width} depth={depth} height={height} material={material} type={type} />;
      case 'sofa':
        return <SofaGeometry width={width} depth={depth} height={height} material={material} />;
      case 'cabinet':
        return <CabinetGeometry width={width} depth={depth} height={height} material={material} />;
      default:
        return (
          <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
            <boxGeometry args={[width, height, depth]} />
            <primitive object={material} attach="material" />
          </mesh>
        );
    }
  };

  return (
    <group 
      rotation={[0, -(rotation * Math.PI) / 180, 0]} 
    >
      {renderContent()}
    </group>
  );
}

function ModelLoader({ url, width, height, depth }: { url: string, width: number, height: number, depth: number }) {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Auto-scaling logic
  // We want the model to fit within the box defined by width, height, depth
  // But usually we just want to match the largest dimension or plausible scale.
  // Let's compute the bounding box of the model.
  const { scale, centerOffset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // If size is 0 (empty model), fallback
    if (size.x === 0 || size.y === 0 || size.z === 0) return { scale: 1, centerOffset: [0,0,0] as [number,number,number] };

    // Determine scale factor
    // We want the model's dimensions to roughly match the target furniture dimensions.
    // However, stretching it non-uniformly might look bad.
    // Let's scale uniformly to fit the target bounding box as best as possible without exceeding it.
    const scaleX = width / size.x;
    const scaleY = height / size.y;
    const scaleZ = depth / size.z;
    const scaleFactor = Math.min(scaleX, scaleY, scaleZ);

    return {
      scale: scaleFactor,
      centerOffset: [-center.x * scaleFactor, -box.min.y * scaleFactor, -center.z * scaleFactor] as [number, number, number]
    };
  }, [clonedScene, width, height, depth]);

  return (
    <primitive 
      object={clonedScene} 
      scale={[scale, scale, scale]} 
      position={centerOffset}
      castShadow
      receiveShadow
    />
  );
}

// Procedural Geometries Fallback

function ChairGeometry({ width, depth, height, material }: { width: number, depth: number, height: number, material: THREE.Material }) {
  const seatHeight = height * 0.45;
  const legThickness = Math.min(width, depth) * 0.1;
  const backHeight = height - seatHeight;
  const backThickness = depth * 0.1;

  return (
    <group position={[0, height / 2, 0]}>
      {/* Seat */}
      <mesh position={[0, seatHeight - height/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, legThickness, depth]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Backrest */}
      <mesh position={[0, (seatHeight + backHeight/2) - height/2, -depth/2 + backThickness/2]} castShadow receiveShadow>
        <boxGeometry args={[width, backHeight, backThickness]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Legs (4) */}
      <mesh position={[-width/2 + legThickness/2, (seatHeight/2) - height/2, -depth/2 + legThickness/2]} castShadow receiveShadow>
        <boxGeometry args={[legThickness, seatHeight, legThickness]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[width/2 - legThickness/2, (seatHeight/2) - height/2, -depth/2 + legThickness/2]} castShadow receiveShadow>
        <boxGeometry args={[legThickness, seatHeight, legThickness]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[-width/2 + legThickness/2, (seatHeight/2) - height/2, depth/2 - legThickness/2]} castShadow receiveShadow>
        <boxGeometry args={[legThickness, seatHeight, legThickness]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[width/2 - legThickness/2, (seatHeight/2) - height/2, depth/2 - legThickness/2]} castShadow receiveShadow>
        <boxGeometry args={[legThickness, seatHeight, legThickness]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

function TableGeometry({ width, depth, height, material }: { width: number, depth: number, height: number, material: THREE.Material, type: string }) {
  const topThickness = height * 0.05;
  const legThickness = Math.min(width, depth) * 0.08;
  
  return (
    <group position={[0, height / 2, 0]}>
      {/* Table Top */}
      <mesh position={[0, height/2 - topThickness/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, topThickness, depth]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Legs (4) */}
      <mesh position={[-width/2 + legThickness, 0, -depth/2 + legThickness]} castShadow receiveShadow>
        <boxGeometry args={[legThickness, height, legThickness]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[width/2 - legThickness, 0, -depth/2 + legThickness]} castShadow receiveShadow>
        <boxGeometry args={[legThickness, height, legThickness]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[-width/2 + legThickness, 0, depth/2 - legThickness]} castShadow receiveShadow>
        <boxGeometry args={[legThickness, height, legThickness]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[width/2 - legThickness, 0, depth/2 - legThickness]} castShadow receiveShadow>
        <boxGeometry args={[legThickness, height, legThickness]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

function SofaGeometry({ width, depth, height, material }: { width: number, depth: number, height: number, material: THREE.Material }) {
  const seatHeight = height * 0.4;
  const backHeight = height;
  const backThickness = depth * 0.2;
  const armWidth = width * 0.1;
  const armHeight = height * 0.6;

  return (
    <group position={[0, height / 2, 0]}>
      {/* Seat Base */}
      <mesh position={[0, seatHeight/2 - height/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, seatHeight, depth]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Backrest */}
      <mesh position={[0, backHeight/2 - height/2, -depth/2 + backThickness/2]} castShadow receiveShadow>
        <boxGeometry args={[width, backHeight, backThickness]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Arms */}
      <mesh position={[-width/2 + armWidth/2, armHeight/2 - height/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[armWidth, armHeight, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[width/2 - armWidth/2, armHeight/2 - height/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[armWidth, armHeight, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

function CabinetGeometry({ width, depth, height, material }: { width: number, depth: number, height: number, material: THREE.Material }) {
  return (
    <group position={[0, height / 2, 0]}>
      {/* Main Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}
