"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { db, auth } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

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

export interface Room {
  width: number;
  length: number;
  height: number;
  wallColor: string;
  floorColor: string;
}

export interface Design {
  id: string;
  name: string;
  customerName: string;
  room: Room;
  furniture: FurnitureItem[];
  createdAt: string;
  updatedAt: string;
}

interface DesignContextType {
  designs: Design[];
  currentDesign: Design | null;
  setCurrentDesign: (design: Design | null) => void;
  saveDesign: (design: Design) => void;
  deleteDesign: (id: string) => void;
  updateDesignFurniture: (furniture: FurnitureItem[]) => void;
  updateDesignRoom: (room: Room) => void;
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export function DesignProvider({ children }: { children: React.ReactNode }) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [currentDesign, setCurrentDesign] = useState<Design | null>(null);

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
    setCurrentDesign(designToSave);

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
      setCurrentDesign(null);
    }
    // TODO: Delete from Firestore if needed
  }, [designs, currentDesign]);

  const updateDesignFurniture = useCallback((furniture: FurnitureItem[]) => {
    if (currentDesign) {
      const updated = { ...currentDesign, furniture };
      setCurrentDesign(updated);
    }
  }, [currentDesign]);

  const updateDesignRoom = useCallback((room: Room) => {
    if (currentDesign) {
      const updated = { ...currentDesign, room };
      setCurrentDesign(updated);
    }
  }, [currentDesign]);

  const value = useMemo(() => ({
    designs,
    currentDesign,
    setCurrentDesign,
    saveDesign,
    deleteDesign,
    updateDesignFurniture,
    updateDesignRoom,
  }), [designs, currentDesign, saveDesign, deleteDesign, updateDesignFurniture, updateDesignRoom]);

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
