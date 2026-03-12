"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { db, auth } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export interface WallFeature {
  id: string;
  type: 'door' | 'window' | 'opening';
  wall: 'front' | 'back' | 'left' | 'right';
  position: number; // Center position along the wall
  width: number;
  height: number;
  elevation: number; // Distance from floor (0 for doors)
}

export interface FurnitureItem {
  id: string;
  type: 'chair' | 'dining-table' | 'side-table' | 'sofa' | 'cabinet' | 'clock' | 'picture-frame' | 'fireplace';
  name: string;
  width: number;
  depth: number;
  height: number;
  color: string;
  price?: string;
  imageUrl?: string;
  position?: { x: number; y: number };
  rotation?: number;
  modelUrl?: string;
  elevation?: number;
  modelRotationOffset?: [number, number, number];
}

export type WallSide = 'front' | 'back' | 'left' | 'right';

export interface Room {
  width: number;
  length: number;
  height: number;
  wallColor: string;
  wallColors?: { front?: string; back?: string; left?: string; right?: string };
  floorColor: string;
  position?: { x: number; z: number };
  features?: WallFeature[];
}

export interface RoomData {
  id: string;
  name: string;
  room: Room;
  furniture: FurnitureItem[];
}

export interface Design {
  id: string;
  name: string;
  customerName: string;
  specialNotes?: string;
  isLocked?: boolean;
  requestId?: string;
  rooms: RoomData[];
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility
  room?: Room;
  furniture?: FurnitureItem[];
}

interface DesignContextType {
  designs: Design[];
  currentDesign: Design | null;
  setCurrentDesign: (design: Design | null) => void;
  saveDesign: (design: Design) => void;
  deleteDesign: (id: string) => void;
  
  // Multi-room extensions
  activeRoomId: string | null;
  setActiveRoomId: (id: string) => void;
  currentRoom: RoomData | null;
  addRoom: (name: string) => void; // Updated signature
  deleteRoom: (roomId: string) => void;
  updateDesignFurniture: (furniture: FurnitureItem[]) => void;
  updateDesignRoom: (roomData: Partial<Room>) => void;
  updateRoomPosition: (roomId: string, position: { x: number, z: number }) => void;
  addWallFeature: (feature: Omit<WallFeature, 'id'>) => void;
  updateWallFeature: (id: string, featureData: Partial<WallFeature>) => void;
  removeWallFeature: (id: string) => void;
  updateFurnitureColor: (id: string, color: string) => void;
  updateWallColor: (wall: WallSide | 'all', color: string) => void;
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export function DesignProvider({ children }: { children: React.ReactNode }) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [currentDesign, setCurrentDesignRaw] = useState<Design | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // Wrapper for setCurrentDesign to handle migration
  const setCurrentDesign = useCallback((designOrUpdater: Design | null | ((prev: Design | null) => Design | null)) => {
    setCurrentDesignRaw(prev => {
      let designToSet: Design | null;
      if (typeof designOrUpdater === 'function') {
        designToSet = designOrUpdater(prev);
      } else {
        designToSet = designOrUpdater;
      }

      if (!designToSet) {
        setActiveRoomId(null);
        return null;
      }

      // Migrate from single room to multiple rooms if needed
      if (!designToSet.rooms || designToSet.rooms.length === 0) {
        const roomData: RoomData = {
          id: 'default',
          name: 'Main Room',
          room: designToSet.room || { width: 5, length: 4, height: 2.7, wallColor: '#354840', floorColor: '#D4A574' },
          furniture: designToSet.furniture || [],
        };
        
        designToSet = { ...designToSet, rooms: [roomData] };
        
        // Remove legacy fields to clean up
        delete designToSet.room;
        delete designToSet.furniture;
      }
      
      // Ensure all rooms have a default position if they don't
      designToSet.rooms = designToSet.rooms.map((r, index) => ({
          ...r,
          room: {
              ...r.room,
              position: r.room.position || { 
                  x: index * 6, // Offset default positions so they don't all stack perfectly
                  z: 0 
              }
          }
      }));

      // Auto-select first room if none is selected or if current one not found
      if (!activeRoomId || !designToSet.rooms.find(r => r.id === activeRoomId)) {
        setActiveRoomId(designToSet.rooms[0].id);
      }
      return designToSet;
    });
  }, [activeRoomId]);

  const currentRoom = useMemo(() => {
    if (!currentDesign || !currentDesign.rooms) return null;
    return currentDesign.rooms.find(r => r.id === activeRoomId) || currentDesign.rooms[0] || null;
  }, [currentDesign, activeRoomId]);

  useEffect(() => {
    // Load designs from localStorage
    const storedDesigns = localStorage.getItem('furnitureapp_designs');
    if (storedDesigns) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDesigns(JSON.parse(storedDesigns));
    }
  }, []);

  const saveDesign = useCallback(async (design: Design) => {
    const existingIndex = designs.findIndex(d => d.id === design.id);
    let updatedDesigns;
    const timestamp = new Date().toISOString();
    const designToSave = { ...design, updatedAt: timestamp };
    
    // Update local state and storage
    if (existingIndex >= 0) {
      updatedDesigns = [...designs];
      updatedDesigns[existingIndex] = designToSave;
    } else {
      updatedDesigns = [...designs, designToSave];
    }
    
    setDesigns(updatedDesigns);
    localStorage.setItem('furnitureapp_designs', JSON.stringify(updatedDesigns));
    setCurrentDesignRaw(designToSave); // We use raw here because the structure is already guaranteed migrated

    // Save to Firestore if user is logged in
    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, "designs", design.id), {
          ...designToSave,
          userId: user.uid,
        });
        console.log("Design saved to Firestore");
      } catch (error) {
        console.error("Error saving design to Firestore:", error);
      }
    }
  }, [designs]);

  const deleteDesign = useCallback((id: string) => {
    const updatedDesigns = designs.filter(d => d.id !== id);
    setDesigns(updatedDesigns);
    localStorage.setItem('furnitureapp_designs', JSON.stringify(updatedDesigns));
    if (currentDesign?.id === id) {
      setCurrentDesignRaw(null);
      setActiveRoomId(null);
    }
    // TODO: Delete from Firestore if needed
  }, [designs, currentDesign]);

  const updateDesignFurniture = useCallback((furniture: FurnitureItem[]) => {
    setCurrentDesign(prev => {
      if (!prev || !activeRoomId) return prev;
      const updatedRooms = prev.rooms.map(r => 
        r.id === activeRoomId ? { ...r, furniture } : r
      );
      return { ...prev, rooms: updatedRooms, updatedAt: new Date().toISOString() };
    });
  }, [activeRoomId, setCurrentDesign]);

  const updateDesignRoom = useCallback((roomData: Partial<Room>) => {
    setCurrentDesign(prev => {
      if (!prev || !activeRoomId) return prev;
      const updatedRooms = prev.rooms.map(r => 
        r.id === activeRoomId ? { ...r, room: { ...r.room, ...roomData } } : r
      );
      return { ...prev, rooms: updatedRooms, updatedAt: new Date().toISOString() };
    });
  }, [activeRoomId, setCurrentDesign]);

  const addRoom = useCallback((name: string) => {
    setCurrentDesign(prev => {
      if (!prev) return prev;
      
      // Calculate a default position slightly offset from the last room, or 0,0
      let nextX = 0;
      let nextZ = 0;
      if (prev.rooms && prev.rooms.length > 0) {
          const lastRoom = prev.rooms[prev.rooms.length - 1];
          nextX = (lastRoom.room.position?.x || 0) + (lastRoom.room.width || 5) + 1; // 1 meter gap
          nextZ = lastRoom.room.position?.z || 0;
      }

      const newRoom: RoomData = {
          id: crypto.randomUUID(),
          name,
          room: { width: 5, length: 4, height: 2.7, wallColor: '#354840', floorColor: '#D4A574', position: { x: nextX, z: nextZ } },
          furniture: []
      };

      const updatedRooms = [...(prev.rooms || []), newRoom];
      setActiveRoomId(newRoom.id); // Set active room immediately
      return { ...prev, rooms: updatedRooms, updatedAt: new Date().toISOString() };
    });
  }, [setCurrentDesign]);

  const deleteRoom = useCallback((roomId: string) => {
    setCurrentDesign(prev => {
      if (!prev || !prev.rooms) return prev;
      if (prev.rooms.length <= 1) return prev; // Don't delete last room
      
      const updatedRooms = prev.rooms.filter(r => r.id !== roomId);
      
      if (activeRoomId === roomId) {
          setActiveRoomId(updatedRooms[0].id);
      }
      return { ...prev, rooms: updatedRooms, updatedAt: new Date().toISOString() };
    });
  }, [activeRoomId, setCurrentDesign]);

  const updateRoomPosition = useCallback((roomId: string, position: { x: number, z: number }) => {
    setCurrentDesign(prev => {
      if (!prev || !prev.rooms) return prev;
      return {
        ...prev,
        rooms: prev.rooms.map(r => 
          r.id === roomId 
            ? { ...r, room: { ...r.room, position } }
            : r
        ),
        updatedAt: new Date().toISOString()
      };
    });
  }, [setCurrentDesign]);

  const updateFurnitureColor = useCallback((id: string, color: string) => {
    setCurrentDesign(prev => {
      if (!prev || !activeRoomId) return prev;
      const updatedRooms = prev.rooms.map(r =>
        r.id === activeRoomId
          ? { ...r, furniture: r.furniture.map(f => f.id === id ? { ...f, color } : f) }
          : r
      );
      return { ...prev, rooms: updatedRooms, updatedAt: new Date().toISOString() };
    });
  }, [activeRoomId, setCurrentDesign]);

  const updateWallColor = useCallback((wall: WallSide | 'all', color: string) => {
    setCurrentDesign(prev => {
      if (!prev || !activeRoomId) return prev;
      const updatedRooms = prev.rooms.map(r => {
        if (r.id !== activeRoomId) return r;
        if (wall === 'all') {
          // Reset per-wall overrides and set global
          return { ...r, room: { ...r.room, wallColor: color, wallColors: undefined } };
        }
        return {
          ...r,
          room: {
            ...r.room,
            wallColors: { ...r.room.wallColors, [wall]: color },
          },
        };
      });
      return { ...prev, rooms: updatedRooms, updatedAt: new Date().toISOString() };
    });
  }, [activeRoomId, setCurrentDesign]);

  const addWallFeature = useCallback((featureData: Omit<WallFeature, 'id'>) => {
    if (!activeRoomId) return;
    const newFeature: WallFeature = { ...featureData, id: Date.now().toString() };
    setCurrentDesign(prev => {
      if (!prev || !prev.rooms) return prev;
      return {
        ...prev,
        rooms: prev.rooms.map(r => {
          if (r.id === activeRoomId) {
            const existingFeatures = r.room.features || [];
            return {
              ...r,
              room: { ...r.room, features: [...existingFeatures, newFeature] }
            };
          }
          return r;
        }),
        updatedAt: new Date().toISOString()
      };
    });
  }, [activeRoomId, setCurrentDesign]);

  const updateWallFeature = useCallback((id: string, featureData: Partial<WallFeature>) => {
    if (!activeRoomId) return;
    setCurrentDesign(prev => {
      if (!prev || !prev.rooms) return prev;
      return {
        ...prev,
        rooms: prev.rooms.map(r => {
          if (r.id === activeRoomId) {
            const features = r.room.features || [];
            return {
              ...r,
              room: {
                ...r.room,
                features: features.map(f => f.id === id ? { ...f, ...featureData } : f)
              }
            };
          }
          return r;
        }),
        updatedAt: new Date().toISOString()
      };
    });
  }, [activeRoomId, setCurrentDesign]);

  const removeWallFeature = useCallback((id: string) => {
    if (!activeRoomId) return;
    setCurrentDesign(prev => {
      if (!prev || !prev.rooms) return prev;
      return {
        ...prev,
        rooms: prev.rooms.map(r => {
          if (r.id === activeRoomId) {
            const features = r.room.features || [];
            return {
              ...r,
              room: {
                ...r.room,
                features: features.filter(f => f.id !== id)
              }
            };
          }
          return r;
        }),
        updatedAt: new Date().toISOString()
      };
    });
  }, [activeRoomId, setCurrentDesign]);

  const value = useMemo(() => ({
    designs,
    currentDesign,
    setCurrentDesign,
    saveDesign,
    deleteDesign,
    activeRoomId,
    setActiveRoomId,
    currentRoom,
    addRoom,
    deleteRoom,
    updateDesignFurniture,
    updateDesignRoom,
    updateRoomPosition,
    addWallFeature,
    updateWallFeature,
    removeWallFeature,
    updateFurnitureColor,
    updateWallColor,
  }), [
    designs,
    currentDesign,
    setCurrentDesign,
    saveDesign,
    deleteDesign,
    activeRoomId,
    currentRoom,
    addRoom,
    deleteRoom,
    updateDesignFurniture,
    updateDesignRoom,
    updateRoomPosition,
    addWallFeature,
    updateWallFeature,
    removeWallFeature,
    updateFurnitureColor,
    updateWallColor,
  ]);

  return (
    <DesignContext.Provider value={value}>
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  const context = useContext(DesignContext);
  if (context === undefined) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
}
