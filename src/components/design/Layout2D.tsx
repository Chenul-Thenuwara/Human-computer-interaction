"use client";

import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDesign, FurnitureItem } from '../../lib/design-context';
import { fetchFurnitureFromDB } from '../../lib/furniture';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { FurnitureLibraryItem } from './FurnitureLibraryItem';
import { FloorPlan } from './FloorPlan';
import { Sofa, Trash2, RotateCw, Info } from 'lucide-react';
import { toast } from 'sonner';
import { motion, Variants } from 'framer-motion';

export function Layout2D() {
  const { currentDesign, updateDesignFurniture } = useDesign();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [furnitureLibrary, setFurnitureLibrary] = useState<FurnitureItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchFurnitureFromDB();
        setFurnitureLibrary(data);
      } catch (error) {
        console.error("Error fetching furniture:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (!currentDesign) return null;

  const handleAddFurniture = (furnitureType: Omit<FurnitureItem, 'id' | 'position' | 'rotation'>) => {
    const newItem: FurnitureItem = {
      ...furnitureType,
      id: `${furnitureType.type}-${Date.now()}`,
      position: { x: 1, y: 1 },
      rotation: 0,
    };

    updateDesignFurniture([...currentDesign.furniture, newItem]);
    toast.success(`${furnitureType.name} added to room`);
  };

  const handleDropFurniture = (furnitureType: Omit<FurnitureItem, 'id' | 'position' | 'rotation'>, position: { x: number; y: number }) => {
    const newItem: FurnitureItem = {
      ...furnitureType,
      id: `${furnitureType.type}-${Date.now()}`,
      position,
      rotation: 0,
    };

    updateDesignFurniture([...currentDesign.furniture, newItem]);
    setSelectedItem(newItem.id);
    toast.success(`${furnitureType.name} placed in room`);
  };

  const handleRemoveItem = (id: string) => {
    const updated = currentDesign.furniture.filter(item => item.id !== id);
    updateDesignFurniture(updated);
    if (selectedItem === id) {
      setSelectedItem(null);
    }
    toast.success('Item removed');
  };

  const handleRotateItem = (id: string) => {
    const updated = currentDesign.furniture.map(item =>
      item.id === id
        ? { ...item, rotation: ((item.rotation || 0) + 90) % 360 }
        : item
    );
    updateDesignFurniture(updated);
  };

  const handleUpdatePosition = (id: string, position: { x: number; y: number }) => {
    const updated = currentDesign.furniture.map(item =>
      item.id === id ? { ...item, position } : item
    );
    updateDesignFurniture(updated);
  };

  const selectedFurniture = currentDesign.furniture.find(item => item.id === selectedItem);

  // Group furniture by type
  const groupedFurniture = furnitureLibrary.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, FurnitureItem[]>);

  const typeLabels = {
    'chair': 'Chairs',
    'dining-table': 'Dining Tables',
    'side-table': 'Side Tables',
    'sofa': 'Sofas',
    'cabinet': 'Cabinets',
    'clock': 'Clocks',
    'picture-frame': 'Picture Frames',
    'fireplace': 'Fireplaces',
  };

  const slideRight: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: 0.2 } }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex overflow-hidden">
        {/* Furniture Library Sidebar */}
        <motion.div
          variants={slideRight}
          initial="hidden"
          animate="visible"
          className="backdrop-blur-xl bg-card/70 border-r border-white/20 flex flex-col w-80 shadow-lg h-full z-10"
        >
          <div className="p-4 border-b border-white/20">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: 'Jacques Francois, serif' }}>
              <Sofa className="w-5 h-5" />
              Furniture Library
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Click items to add them to your room
            </p>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {loading ? (
                <div className="text-sm text-white/50 animate-pulse">Loading furniture library...</div>
              ) : (
                Object.entries(groupedFurniture).map(([type, items]) => (
                  <div key={type}>
                    <h3 className="text-sm font-medium text-accent mb-3">
                      {typeLabels[type as keyof typeof typeLabels]}
                    </h3>
                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <FurnitureLibraryItem
                          key={`${type}-${index}`}
                          item={item}
                          onAdd={() => handleAddFurniture(item)}
                        />
                      ))}
                    </div>
                  </div>
                )))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent" />
              <p>
                Click furniture images to add them to your floor plan.
                Drag items to reposition, and use controls below to rotate or remove.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Canvas */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col h-full bg-background/50 relative"
        >
          <div className="flex-1 p-6 overflow-auto flex items-center justify-center pb-32">
            <FloorPlan
              room={currentDesign.room}
              furniture={currentDesign.furniture}
              selectedItem={selectedItem}
              onSelectItem={setSelectedItem}
              onUpdatePosition={handleUpdatePosition}
              onDropItem={handleDropFurniture}
            />
          </div>

          {/* Bottom Panel - Selected Item Controls */}
          {selectedFurniture && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-in slide-in-from-bottom-5">
              <Card className="backdrop-blur-xl bg-card/95 border-primary/40 shadow-xl w-auto min-w-[350px]">
                <CardHeader className="pb-3 pt-4">
                  <CardTitle className="text-base flex items-center justify-between text-foreground">
                    <span>Selected: {selectedFurniture.name}</span>
                    <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30">
                      {selectedFurniture.width}m × {selectedFurniture.depth}m
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRotateItem(selectedFurniture.id)}
                      className="border-white/20 text-foreground hover:bg-white/10"
                    >
                      <RotateCw className="w-4 h-4 mr-2" />
                      Rotate 90°
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveItem(selectedFurniture.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                    <div className="ml-auto text-sm text-muted-foreground">
                      Position: {selectedFurniture.position?.x.toFixed(2)}m, {selectedFurniture.position?.y.toFixed(2)}m
                      {selectedFurniture.rotation ? ` | Rotation: ${selectedFurniture.rotation}°` : ''}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </DndProvider>
  );
}
