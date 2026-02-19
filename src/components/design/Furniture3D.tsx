"use client";

import { useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { FurnitureItem } from "@/lib/design-context";
import { storage } from "@/lib/firebase";
import { ref, getDownloadURL } from "firebase/storage";

interface Furniture3DProps {
  item: FurnitureItem;
}

export function Furniture3D({ item }: Furniture3DProps) {
  const { type, width, depth, height, color, modelUrl, rotation = 0, elevation = 0, modelRotationOffset = [0, 0, 0] } = item;
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const resolveUrl = async () => {
      if (!modelUrl) {
        if (isMounted) setResolvedUrl(null);
        return;
      }

      // If it's a full URL or absolute local path, use it directly
      if (modelUrl.startsWith('http') || modelUrl.startsWith('/')) {
        if (isMounted) setResolvedUrl(modelUrl);
        return;
      }

      // Otherwise, treat as Firebase Storage path and resolve it
      try {
        const storageRef = ref(storage, modelUrl);
        const url = await getDownloadURL(storageRef);
        if (isMounted) {
          // Use our local proxy to bypass CORS
          const proxyUrl = `/api/model-proxy?url=${encodeURIComponent(url)}`;
          setResolvedUrl(proxyUrl);
        }
      } catch (error) {
        console.error(`Failed to resolve model URL: ${modelUrl}`, error);
        if (isMounted) {
          setResolvedUrl(null);
        }
      }
    };

    resolveUrl();

    return () => {
      isMounted = false;
    };
  }, [modelUrl]);

  // Convert material (for procedural fallback)
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.1,
    });
  }, [color]);

  const renderContent = () => {
    if (resolvedUrl) {
      return (
        <ModelLoader 
          url={resolvedUrl} 
          width={width} 
          height={height} 
          depth={depth}
          rotationOffset={modelRotationOffset} 
        />
      );
    }

    // Fallback to procedural geometry (same as before) or while loading
    // If modelUrl exists but not resolved yet, we might want to show nothing or a loader.
    // But falling back to procedural geometry is a good "loading state" if available.
    if (modelUrl && !resolvedUrl) {
        // Optional: return null or a loader? 
        // Returning procedural fallback allows instant feedback while model loads.
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
      case 'clock':
        return <ClockGeometry radius={width / 2} depth={depth} material={material} />;
      case 'picture-frame':
        return <PictureFrameGeometry width={width} height={height} depth={depth} material={material} />;
      case 'fireplace':
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
      position={[0, elevation, 0]}
    >
      {renderContent()}
    </group>
  );
}

function ModelLoader({ url, width, height, depth, rotationOffset = [0, 0, 0] }: { url: string, width: number, height: number, depth: number, rotationOffset?: [number, number, number] }) {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Auto-scaling logic
  // We want the model to fit within the box defined by width, height, depth
  // But usually we just want to match the largest dimension or plausible scale.
  // Let's compute the bounding box of the model.
  const { scale, centerOffset } = useMemo(() => {
    const box = new THREE.Box3();
    
    // Traverse and expand box only for meshes to avoid including lights/cameras
    clonedScene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        box.expandByObject(obj);
      }
    });

    // Fallback if no meshes found
    if (box.isEmpty()) {
      box.setFromObject(clonedScene);
    }

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
    
    // Check if rotated 90 degrees around X-axis (approx)
    const isRotatedX = Math.abs(rotationOffset[0] - Math.PI / 2) < 0.1;

    const scaleX = width / size.x;
    const scaleY = (isRotatedX ? depth : height) / size.y;
    const scaleZ = (isRotatedX ? height : depth) / size.z;
    const scaleFactor = Math.min(scaleX, scaleY, scaleZ);

    return {
      scale: scaleFactor,
      centerOffset: [-center.x * scaleFactor, -box.min.y * scaleFactor, -center.z * scaleFactor] as [number, number, number]
    };
  }, [clonedScene, width, height, depth, rotationOffset]);

  return (
    <primitive 
      object={clonedScene} 
      scale={[scale, scale, scale]} 
      position={centerOffset}
      rotation={rotationOffset}
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

function ClockGeometry({ radius, depth, material }: { radius: number, depth: number, material: THREE.Material }) {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, depth, 32]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Clock Face Details (simplified) */}
      <mesh position={[0, depth / 2 + 0.001, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[radius * 0.9, radius * 0.9, 0.001, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Hands */}
      <mesh position={[0, depth / 2 + 0.002, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[radius * 0.05, 0.001, radius * 0.8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0, depth / 2 + 0.002, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[radius * 0.05, 0.001, radius * 0.5]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}

function PictureFrameGeometry({ width, height, depth, material }: { width: number, height: number, depth: number, material: THREE.Material }) {
  const frameThickness = Math.min(width, height) * 0.1;
  
  return (
    <group>
      {/* Frame Background/Backing */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* Picture Area (White Canvas) */}
      <mesh position={[0, 0, depth / 2 + 0.001]}>
        <planeGeometry args={[width - frameThickness * 2, height - frameThickness * 2]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Frame Borders (Visual only, handled by backing mesh texture/color mainly but let's add depth if needed) */}
      {/* For simplicity, the backing mesh acts as the frame, and we just put a "canvas" on top */}
    </group>
  );
}
