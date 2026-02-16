"use client";

import { useEffect } from 'react';
import { RoomSetup } from '@/components/design/RoomSetup';
import { useDesign, Design } from '@/lib/design-context';

export default function NewDesignPage() {
  const { setCurrentDesign } = useDesign();

  useEffect(() => {
    // Initialize a new design
    const newDesign: Design = {
      id: Date.now().toString(),
      name: 'Untitled Design',
      customerName: '',
      room: {
        width: 5,
        length: 4,
        height: 2.7,
        wallColor: '#354840',
        floorColor: '#D4A574',
      },
      furniture: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentDesign(newDesign);
  }, [setCurrentDesign]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Create New Design</h1>
        <div className="h-[800px] border rounded-lg overflow-hidden relative">
           <div className="absolute inset-0">
             <RoomSetup />
           </div>
        </div>
      </div>
    </div>
  );
}
