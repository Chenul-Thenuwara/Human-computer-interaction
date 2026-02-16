"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export interface FurnitureItem {
  id: string;
  type: 'chair' | 'dining-table' | 'side-table' | 'sofa' | 'cabinet';
  name: string;
  width: number;
  depth: number;
  height: number;
  color: string;
  imageUrl?: string;
  position?: { x: number; y: number };
  rotation?: number;
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

  const saveDesign = useCallback((design: Design) => {
    const existingIndex = designs.findIndex(d => d.id === design.id);
    let updatedDesigns;
    
    if (existingIndex >= 0) {
      updatedDesigns = [...designs];
      updatedDesigns[existingIndex] = { ...design, updatedAt: new Date().toISOString() };
    } else {
      updatedDesigns = [...designs, design];
    }
    
    setDesigns(updatedDesigns);
    localStorage.setItem('furnitureapp_designs', JSON.stringify(updatedDesigns));
    setCurrentDesign(design);
  }, [designs]);

  const deleteDesign = useCallback((id: string) => {
    const updatedDesigns = designs.filter(d => d.id !== id);
    setDesigns(updatedDesigns);
    localStorage.setItem('furnitureapp_designs', JSON.stringify(updatedDesigns));
    if (currentDesign?.id === id) {
      setCurrentDesign(null);
    }
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
