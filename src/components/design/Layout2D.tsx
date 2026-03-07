"use client";

import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDesign, FurnitureItem, WallFeature } from '../../lib/design-context';
import { fetchFurnitureFromDB } from '../../lib/furniture';

import { Button } from '../ui/button';

import { ScrollArea } from '../ui/scroll-area';
import { FurnitureLibraryItem } from './FurnitureLibraryItem';
import { FloorPlan } from './FloorPlan';
import { Sofa, Trash2, Info, Ruler, Palette, ChevronRight, Settings, Plus, Box } from 'lucide-react';
import { toast } from 'sonner';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Separator } from '../ui/separator';

export function Layout2D({ mode = 'full' }: { mode?: 'full' | 'builder' }) {
  const { currentDesign, activeRoomId, setActiveRoomId, updateDesignFurniture, updateRoomPosition, updateDesignRoom } = useDesign();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [furnitureLibrary, setFurnitureLibrary] = useState<FurnitureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(true);

  // New state from context for Wall Features
  const { addWallFeature, updateWallFeature, removeWallFeature } = useDesign();

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

  if (!currentDesign || !currentDesign.rooms) return null;

  const currentRoom = currentDesign.rooms.find(r => r.id === activeRoomId) || currentDesign.rooms[0];

  const handleAddFurniture = (furnitureType: Omit<FurnitureItem, 'id' | 'position' | 'rotation'>) => {
    const newItem: FurnitureItem = {
      ...furnitureType,
      id: `${furnitureType.type}-${Date.now()}`,
      position: { x: 1, y: 1 },
      rotation: 0,
    };

    updateDesignFurniture([...currentRoom.furniture, newItem]);
    toast.success(`${furnitureType.name} added to room`);
  };

  const handleDropFurniture = (furnitureType: Omit<FurnitureItem, 'id' | 'position' | 'rotation'>, position: { x: number; y: number }) => {
    const newItem: FurnitureItem = {
      ...furnitureType,
      id: `${furnitureType.type}-${Date.now()}`,
      position,
      rotation: 0,
    };

    updateDesignFurniture([...currentRoom.furniture, newItem]);
    setSelectedItem(newItem.id);
    toast.success(`${furnitureType.name} placed in room`);
  };

  const handleRemoveItem = (id: string) => {
    const updated = currentRoom.furniture.filter(item => item.id !== id);
    updateDesignFurniture(updated);
    if (selectedItem === id) {
      setSelectedItem(null);
    }
    toast.success('Item removed');
  };


  const handleUpdatePosition = (id: string, position: { x: number; y: number }) => {
    const updated = currentRoom.furniture.map(item =>
      item.id === id ? { ...item, position } : item
    );
    updateDesignFurniture(updated);
  };

  const handleUpdateRotation = (id: string, rotation: number) => {
    const updated = currentRoom.furniture.map(item =>
      item.id === id ? { ...item, rotation } : item
    );
    updateDesignFurniture(updated);
  };



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



  const colorPresets = {
    walls: [
      { name: 'White', color: '#FFFFFF' },
      { name: 'Sage Green', color: '#354840' },
      { name: 'Light Gray', color: '#E5E7EB' },
      { name: 'Beige', color: '#F5F5DC' },
    ],
    floors: [
      { name: 'Light Oak', color: '#D4A574' },
      { name: 'Dark Oak', color: '#8B4513' },
      { name: 'Gray Tile', color: '#9CA3AF' },
      { name: 'White Tile', color: '#F3F4F6' },
    ],
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
        {/* Furniture Library Sidebar - Only show in full mode */}
        {mode === 'full' && (
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
        )}

        {/* Main Canvas */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col h-full bg-background/50 relative"
        >
          <div className="flex-1 p-6 overflow-auto flex items-center justify-center pb-32">
            <FloorPlan
              rooms={currentDesign.rooms}
              activeRoomId={activeRoomId}
              onSelectRoom={setActiveRoomId}
              selectedItem={selectedItem}
              onSelectItem={setSelectedItem}
              onUpdateItemPosition={handleUpdatePosition}
              onUpdateItemRotation={handleUpdateRotation}
              onDropItem={handleDropFurniture}
              onUpdateRoomPosition={updateRoomPosition}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          {/* Right Panel - Room Properties */}
          <AnimatePresence>
            {isPropertiesPanelOpen && (
              <motion.div
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute right-0 top-0 bottom-0 w-80 bg-card/90 backdrop-blur-xl border-l border-white/20 shadow-2xl z-20 overflow-y-auto"
              >
                <div className="p-4 border-b border-white/20 flex items-center justify-between sticky top-0 bg-card/95 z-10">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: 'Jacques Francois, serif' }}>
                    <Settings className="w-5 h-5" />
                    Room Properties
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsPropertiesPanelOpen(false)} className="h-8 w-8 hover:bg-white/10">
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </div>

                <div className="p-5 space-y-8 pb-32">
                  {/* Dimensions Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-accent flex items-center gap-2">
                      <Ruler className="w-4 h-4" /> Dimensions
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Width</Label>
                          <span className="text-xs font-medium text-foreground">{currentRoom.room.width.toFixed(1)}m</span>
                        </div>
                        <Slider
                          min={2} max={10} step={0.1}
                          value={[currentRoom.room.width]}
                          onValueChange={(vals) => updateDesignRoom({ ...currentRoom.room, width: vals[0] })}
                          className="w-full"
                          disabled={currentDesign.isLocked}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Length</Label>
                          <span className="text-xs font-medium text-foreground">{currentRoom.room.length.toFixed(1)}m</span>
                        </div>
                        <Slider
                          min={2} max={10} step={0.1}
                          value={[currentRoom.room.length]}
                          onValueChange={(vals) => updateDesignRoom({ ...currentRoom.room, length: vals[0] })}
                          className="w-full"
                          disabled={currentDesign.isLocked}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Height</Label>
                          <span className="text-xs font-medium text-foreground">{currentRoom.room.height.toFixed(1)}m</span>
                        </div>
                        <Slider
                          min={2} max={4} step={0.1}
                          value={[currentRoom.room.height]}
                          onValueChange={(vals) => updateDesignRoom({ ...currentRoom.room, height: vals[0] })}
                          className="w-full"
                          disabled={currentDesign.isLocked}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Colors Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-accent flex items-center gap-2">
                      <Palette className="w-4 h-4" /> Colors
                    </h3>
                    
                    <div className="space-y-3">
                      <Label className="text-xs text-muted-foreground">Wall Color</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {colorPresets.walls.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => updateDesignRoom({ ...currentRoom.room, wallColor: preset.color })}
                            disabled={currentDesign.isLocked}
                            className={`h-8 rounded border transition-all ${currentRoom.room.wallColor === preset.color ? 'border-accent ring-1 ring-accent' : 'border-white/20 hover:border-white/40'}`}
                            style={{ backgroundColor: preset.color }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input type="color" value={currentRoom.room.wallColor} onChange={(e) => updateDesignRoom({ ...currentRoom.room, wallColor: e.target.value })} disabled={currentDesign.isLocked} className="w-12 h-8 p-1" />
                        <Input type="text" value={currentRoom.room.wallColor} onChange={(e) => updateDesignRoom({ ...currentRoom.room, wallColor: e.target.value })} disabled={currentDesign.isLocked} className="h-8 text-xs font-mono" />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <Label className="text-xs text-muted-foreground">Floor Color</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {colorPresets.floors.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => updateDesignRoom({ ...currentRoom.room, floorColor: preset.color })}
                            disabled={currentDesign.isLocked}
                            className={`h-8 rounded border transition-all ${currentRoom.room.floorColor === preset.color ? 'border-accent ring-1 ring-accent' : 'border-white/20 hover:border-white/40'}`}
                            style={{ backgroundColor: preset.color }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input type="color" value={currentRoom.room.floorColor} onChange={(e) => updateDesignRoom({ ...currentRoom.room, floorColor: e.target.value })} disabled={currentDesign.isLocked} className="w-12 h-8 p-1" />
                        <Input type="text" value={currentRoom.room.floorColor} onChange={(e) => updateDesignRoom({ ...currentRoom.room, floorColor: e.target.value })} disabled={currentDesign.isLocked} className="h-8 text-xs font-mono" />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Wall Features Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-accent flex items-center gap-2">
                        <Box className="w-4 h-4" /> Wall Features
                      </h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => addWallFeature({ type: 'door', wall: 'front', position: 2, width: 0.9, height: 2.1, elevation: 0 })}
                        disabled={currentDesign.isLocked}
                        className="h-6 px-2 text-xs text-primary hover:text-primary-foreground hover:bg-primary"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>

                    {!currentRoom.room.features || currentRoom.room.features.length === 0 ? (
                      <div className="text-xs text-muted-foreground text-center py-4 border border-dashed border-white/10 rounded-lg">
                        No features added yet.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentRoom.room.features.map(feature => {
                          const maxPosition = feature.wall === 'front' || feature.wall === 'back' 
                            ? currentRoom.room.width 
                            : currentRoom.room.length;

                          return (
                            <div key={feature.id} className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-3">
                              <div className="flex items-center justify-between">
                                <select 
                                  value={feature.type}
                                  onChange={(e) => updateWallFeature(feature.id, { type: e.target.value as WallFeature['type'] })}
                                  disabled={currentDesign.isLocked}
                                  className="bg-transparent text-sm text-foreground focus:outline-none"
                                >
                                  <option value="door" className="bg-gray-800">Door</option>
                                  <option value="opening" className="bg-gray-800">Opening</option>
                                  <option value="window" className="bg-gray-800">Window</option>
                                </select>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeWallFeature(feature.id)}
                                  disabled={currentDesign.isLocked}
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Wall</Label>
                                <select 
                                  value={feature.wall}
                                  onChange={(e) => updateWallFeature(feature.id, { wall: e.target.value as WallFeature['wall'], position: 1 })}
                                  disabled={currentDesign.isLocked}
                                  className="w-full bg-black/40 border border-white/10 rounded p-1 text-xs text-foreground focus:outline-none"
                                >
                                  <option value="front" className="bg-gray-800">Front (Top)</option>
                                  <option value="back" className="bg-gray-800">Back (Bottom)</option>
                                  <option value="left" className="bg-gray-800">Left</option>
                                  <option value="right" className="bg-gray-800">Right</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <Label className="text-xs text-muted-foreground">Position</Label>
                                  <span className="text-xs text-foreground font-mono">{feature.position.toFixed(1)}m</span>
                                </div>
                                <Slider
                                  min={feature.width / 2}
                                  max={maxPosition - (feature.width / 2)}
                                  step={0.1}
                                  value={[feature.position]}
                                  onValueChange={(vals) => updateWallFeature(feature.id, { position: vals[0] })}
                                  disabled={currentDesign.isLocked}
                                  className="w-full"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <Label className="text-xs text-muted-foreground">Width</Label>
                                  <span className="text-xs text-foreground font-mono">{feature.width.toFixed(1)}m</span>
                                </div>
                                <Slider
                                  min={0.5}
                                  max={3}
                                  step={0.1}
                                  value={[feature.width]}
                                  onValueChange={(vals) => updateWallFeature(feature.id, { width: vals[0] })}
                                  disabled={currentDesign.isLocked}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Button for Properties Panel */}
          {!isPropertiesPanelOpen && (
            <Button
              variant="default"
              size="icon"
              onClick={() => setIsPropertiesPanelOpen(true)}
              className="absolute right-4 top-4 z-10 rounded-full shadow-lg bg-card/80 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/10"
              title="Open Room Properties"
            >
              <Settings className="w-5 h-5" />
            </Button>
          )}

        </motion.div>
      </div>
    </DndProvider>
  );
}
