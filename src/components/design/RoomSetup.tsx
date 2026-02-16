"use client";

import { useState, useEffect } from 'react';
import { useDesign } from '../../lib/design-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Ruler, Palette, FileText } from 'lucide-react';

export function RoomSetup() {
  const { currentDesign, updateDesignRoom, setCurrentDesign } = useDesign();
  
  const [designName, setDesignName] = useState(currentDesign?.name || '');
  const [customerName, setCustomerName] = useState(currentDesign?.customerName || '');
  const [width, setWidth] = useState(currentDesign?.room.width || 5);
  const [length, setLength] = useState(currentDesign?.room.length || 4);
  const [height, setHeight] = useState(currentDesign?.room.height || 2.7);
  const [wallColor, setWallColor] = useState(currentDesign?.room.wallColor || '#F5F5F5');
  const [floorColor, setFloorColor] = useState(currentDesign?.room.floorColor || '#D4A574');

  // Update local state when currentDesign changes (e.g. initial load)
  useEffect(() => {
    if (currentDesign) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDesignName(currentDesign.name || '');
      setCustomerName(currentDesign.customerName || '');
      setWidth(currentDesign.room.width);
      setLength(currentDesign.room.length);
      setHeight(currentDesign.room.height);
      setWallColor(currentDesign.room.wallColor);
      setFloorColor(currentDesign.room.floorColor);
    }
  }, [currentDesign?.id]);

  // Sync room changes to context
  useEffect(() => {
    if (currentDesign) {
      // Avoid infinite loops by checking if values actually changed
      if (
        currentDesign.room.width !== width ||
        currentDesign.room.length !== length ||
        currentDesign.room.height !== height ||
        currentDesign.room.wallColor !== wallColor ||
        currentDesign.room.floorColor !== floorColor
      ) {
        updateDesignRoom({
          width,
          length,
          height,
          wallColor,
          floorColor,
        });
      }
    }
  }, [width, length, height, wallColor, floorColor, updateDesignRoom, currentDesign]);

  const handleDesignNameChange = (value: string) => {
    setDesignName(value);
    if (currentDesign) {
      setCurrentDesign({ ...currentDesign, name: value });
    }
  };

  const handleCustomerNameChange = (value: string) => {
    setCustomerName(value);
    if (currentDesign) {
      setCurrentDesign({ ...currentDesign, customerName: value });
    }
  };

  const presetRooms = [
    { name: 'Small Living Room', width: 4, length: 3.5, height: 2.7 },
    { name: 'Medium Living Room', width: 5, length: 4, height: 2.7 },
    { name: 'Large Living Room', width: 6, length: 5, height: 3 },
    { name: 'Dining Room', width: 4, length: 4, height: 2.7 },
    { name: 'Bedroom', width: 4, length: 3.5, height: 2.5 },
  ];

  const colorPresets = {
    walls: [
      { name: 'White', color: '#FFFFFF' },
      { name: 'Sage Green', color: '#354840' },
      { name: 'Light Gray', color: '#E5E7EB' },
      { name: 'Beige', color: '#F5F5DC' },
      { name: 'Muted Green', color: '#758C7B' },
      { name: 'Dark Green', color: '#26312D' },
    ],
    floors: [
      { name: 'Light Oak', color: '#D4A574' },
      { name: 'Dark Oak', color: '#8B4513' },
      { name: 'Walnut', color: '#6B4423' },
      { name: 'Maple', color: '#E8D4B0' },
      { name: 'Gray Tile', color: '#9CA3AF' },
      { name: 'White Tile', color: '#F3F4F6' },
    ],
  };

  if (!currentDesign) {
    return <div>Loading design...</div>;
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Design Information */}
        <Card className="backdrop-blur-xl bg-card/70 border-white/20 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Design Information
            </CardTitle>
            <CardDescription>
              Enter the basic details for this room design
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="designName" className="text-foreground">Design Name *</Label>
              <Input
                id="designName"
                value={designName}
                onChange={(e) => handleDesignNameChange(e.target.value)}
                placeholder="e.g., Modern Living Room Design"
                className="bg-input-background border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-foreground">Customer Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => handleCustomerNameChange(e.target.value)}
                placeholder="e.g., John Smith"
                className="bg-input-background border-border text-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* Room Dimensions */}
        <Card className="backdrop-blur-xl bg-card/70 border-white/20 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Room Dimensions
            </CardTitle>
            <CardDescription>
              Set the size of the room in meters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Presets */}
            <div>
              <Label className="mb-3 block">Quick Presets</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {presetRooms.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    onClick={() => {
                      setWidth(preset.width);
                      setLength(preset.length);
                      setHeight(preset.height);
                    }}
                    className="text-sm border-white/20 text-foreground hover:bg-white/10"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Width */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="width" className="text-foreground">Width</Label>
                <span className="text-sm font-medium text-accent">{width.toFixed(1)}m</span>
              </div>
              <Slider
                id="width"
                min={2}
                max={10}
                step={0.1}
                value={[width]}
                onValueChange={(values) => setWidth(values[0])}
                className="w-full"
              />
            </div>

            {/* Length */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="length" className="text-foreground">Length</Label>
                <span className="text-sm font-medium text-accent">{length.toFixed(1)}m</span>
              </div>
              <Slider
                id="length"
                min={2}
                max={10}
                step={0.1}
                value={[length]}
                onValueChange={(values) => setLength(values[0])}
                className="w-full"
              />
            </div>

            {/* Height */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="height" className="text-foreground">Height</Label>
                <span className="text-sm font-medium text-accent">{height.toFixed(1)}m</span>
              </div>
              <Slider
                id="height"
                min={2}
                max={4}
                step={0.1}
                value={[height]}
                onValueChange={(values) => setHeight(values[0])}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Color Scheme */}
        <Card className="backdrop-blur-xl bg-card/70 border-white/20 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Color Scheme
            </CardTitle>
            <CardDescription>
              Choose wall and floor colors to match the customer&apos;s preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Wall Color */}
            <div className="space-y-3">
              <Label className="text-foreground">Wall Color</Label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                {colorPresets.walls.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setWallColor(preset.color)}
                    className={`relative h-12 rounded-lg border-2 transition-all ${
                      wallColor === preset.color
                        ? 'border-accent ring-2 ring-accent/30'
                        : 'border-white/20 hover:border-white/30'
                    }`}
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                  >
                    {wallColor === preset.color && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-accent rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="customWallColor" className="text-sm text-foreground">Custom:</Label>
                <Input
                  id="customWallColor"
                  type="color"
                  value={wallColor}
                  onChange={(e) => setWallColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={wallColor}
                  onChange={(e) => setWallColor(e.target.value)}
                  className="flex-1 font-mono text-sm bg-input-background border-border text-foreground"
                />
              </div>
            </div>

            <Separator />

            {/* Floor Color */}
            <div className="space-y-3">
              <Label className="text-foreground">Floor Color</Label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                {colorPresets.floors.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setFloorColor(preset.color)}
                    className={`relative h-12 rounded-lg border-2 transition-all ${
                      floorColor === preset.color
                        ? 'border-accent ring-2 ring-accent/30'
                        : 'border-white/20 hover:border-white/30'
                    }`}
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                  >
                    {floorColor === preset.color && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-accent rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="customFloorColor" className="text-sm text-foreground">Custom:</Label>
                <Input
                  id="customFloorColor"
                  type="color"
                  value={floorColor}
                  onChange={(e) => setFloorColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={floorColor}
                  onChange={(e) => setFloorColor(e.target.value)}
                  className="flex-1 font-mono text-sm bg-input-background border-border text-foreground"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="backdrop-blur-md bg-primary/10 border border-accent/30 rounded-lg p-4 shadow-md">
          <p className="text-sm text-foreground">
            <strong className="text-accent">Tip:</strong> Configure your room settings here, then move to the 2D Layout tab to arrange furniture, 
            and finally view the 3D Visualization to see how everything looks together.
          </p>
        </div>
      </div>
    </div>
  );
}
