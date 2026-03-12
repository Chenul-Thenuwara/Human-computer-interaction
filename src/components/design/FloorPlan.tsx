import { useRef, useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import { RoomData, FurnitureItem } from '../../lib/design-context';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { RotateCw, Trash2, Palette } from 'lucide-react';

interface FloorPlanProps {
  rooms: RoomData[];
  activeRoomId: string | null;
  onSelectRoom: (id: string) => void;
  selectedItem: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdateItemPosition: (id: string, position: { x: number; y: number }) => void;
  onUpdateItemRotation?: (id: string, rotation: number) => void;
  onDropItem?: (item: Omit<FurnitureItem, 'id' | 'position' | 'rotation'>, position: { x: number; y: number }) => void;
  onUpdateRoomPosition: (id: string, position: { x: number; z: number }) => void;
  onRemoveItem?: (id: string) => void;
  onUpdateItemColor?: (id: string, color: string) => void;
}

export function FloorPlan({ rooms, activeRoomId, onSelectRoom, selectedItem, onSelectItem, onUpdateItemPosition, onUpdateItemRotation, onDropItem, onUpdateRoomPosition, onRemoveItem, onUpdateItemColor }: FloorPlanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = 60; // pixels per meter

  // Curated furniture color presets
  const furnitureColorPresets = [
    { name: 'Walnut', color: '#5C3D2E' },
    { name: 'Oak', color: '#C8A876' },
    { name: 'White', color: '#F5F5F5' },
    { name: 'Charcoal', color: '#36454F' },
    { name: 'Slate Blue', color: '#6A7FA8' },
    { name: 'Sage', color: '#78937A' },
    { name: 'Terracotta', color: '#C46B4A' },
    { name: 'Blush', color: '#D4A5A5' },
    { name: 'Navy', color: '#1B2A4A' },
    { name: 'Cream', color: '#FFFDD0' },
    { name: 'Ebony', color: '#1C1C1C' },
    { name: 'Steel', color: '#8C9BAB' },
  ];

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'furniture',
    drop: (item: Omit<FurnitureItem, 'id' | 'position' | 'rotation'>, monitor) => {
      if (!canvasRef.current || !onDropItem) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;

      const x = (clientOffset.x - rect.left) * scaleX;
      const y = (clientOffset.y - rect.top) * scaleY;

      const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];
      if (!activeRoom) return;

      const roomX = 200 + (activeRoom.room.position?.x || 0) * scale;
      const roomY = 200 + (activeRoom.room.position?.z || 0) * scale;

      let newX = (x - roomX) / scale;
      let newY = (y - roomY) / scale;

      const width = item.width;
      const depth = item.depth;
      const halfWidth = width / 2;
      const halfDepth = depth / 2;

      newX = Math.max(halfWidth, Math.min(activeRoom.room.width - halfWidth, newX));
      newY = Math.max(halfDepth, Math.min(activeRoom.room.length - halfDepth, newY));

      onDropItem(item, { x: newX, y: newY });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [rooms, activeRoomId, onDropItem]);

  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [rotatingItem, setRotatingItem] = useState<string | null>(null);
  const [draggingRoom, setDraggingRoom] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Use a fixed larger canvas for the global floor plan, or calculate bounding box
  let minX = 0, minY = 0, maxX = 10, maxY = 10;
  rooms.forEach(r => {
    const rx = r.room.position?.x || 0;
    const rz = r.room.position?.z || 0;
    minX = Math.min(minX, rx);
    minY = Math.min(minY, rz);
    maxX = Math.max(maxX, rx + r.room.width);
    maxY = Math.max(maxY, rz + r.room.length);
  });
  
  const canvasWidth = Math.max(800, (maxX - minX) * scale + 400);
  const canvasHeight = Math.max(600, (maxY - minY) * scale + 400);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid background
    ctx.strokeStyle = '#e2e8f0'; 
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += scale) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += scale) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    rooms.forEach(r => {
      const roomX = 200 + (r.room.position?.x || 0) * scale;
      const roomY = 200 + (r.room.position?.z || 0) * scale;
      const roomWidth = r.room.width * scale;
      const roomHeight = r.room.length * scale;

      // Room background
      ctx.fillStyle = r.room.floorColor;
      ctx.fillRect(roomX, roomY, roomWidth, roomHeight);

      // Room border (Highlight active room)
      if (r.id === activeRoomId) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 4;
      } else {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
      }
      ctx.strokeRect(roomX, roomY, roomWidth, roomHeight);

      // Draw Wall Features (Doors / Openings / Windows)
      if (r.room.features) {
        r.room.features.forEach(feature => {
          let fx = 0, fy = 0, fw = 0, fh = 0;
          const thick = r.id === activeRoomId ? 6 : 5; // Slightly thicker than the wall stroke

          if (feature.wall === 'front') {
            fx = roomX + feature.position * scale - (feature.width * scale) / 2;
            fy = roomY - thick / 2;
            fw = feature.width * scale;
            fh = thick;
          } else if (feature.wall === 'back') {
            fx = roomX + feature.position * scale - (feature.width * scale) / 2;
            fy = roomY + roomHeight - thick / 2;
            fw = feature.width * scale;
            fh = thick;
          } else if (feature.wall === 'left') {
            fx = roomX - thick / 2;
            fy = roomY + feature.position * scale - (feature.width * scale) / 2;
            fw = thick;
            fh = feature.width * scale;
          } else if (feature.wall === 'right') {
            fx = roomX + roomWidth - thick / 2;
            fy = roomY + feature.position * scale - (feature.width * scale) / 2;
            fw = thick;
            fh = feature.width * scale;
          }

          // Cut a hole by drawing the floor color over the wall stroke
          ctx.fillStyle = r.room.floorColor;
          ctx.fillRect(fx, fy, fw, fh);

          if (feature.type === 'door') {
            // Draw a subtle line for the door
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (feature.wall === 'front' || feature.wall === 'back') {
                ctx.moveTo(fx, fy + fh / 2);
                ctx.lineTo(fx + fw, fy + fh / 2);
            } else {
                ctx.moveTo(fx + fw / 2, fy);
                ctx.lineTo(fx + fw / 2, fy + fh);
            }
            ctx.stroke();
          } else if (feature.type === 'window') {
            // Draw a double line for a window
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1;
            ctx.strokeRect(fx, fy, fw, fh);
          }
        });
      }

      // Room Name Label
      ctx.fillStyle = r.id === activeRoomId ? '#ffffff' : '#ffffff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const labelMetrics = ctx.measureText(r.name);
      ctx.fillStyle = r.id === activeRoomId ? '#3b82f6' : 'rgba(30, 41, 59, 0.7)';
      ctx.fillRect(roomX + roomWidth/2 - labelMetrics.width/2 - 6, roomY - 24, labelMetrics.width + 12, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(r.name, roomX + roomWidth / 2, roomY - 14);

      // Dimensions for active room
      if (r.id === activeRoomId) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${r.room.width}m`, roomX + roomWidth / 2, roomY + roomHeight + 15);
        ctx.save();
        ctx.translate(roomX - 15, roomY + roomHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(`${r.room.length}m`, 0, 0);
        ctx.restore();
      }

      // Draw furniture
      r.furniture.forEach((item) => {
        if (!item.position) return;

        const x = roomX + item.position.x * scale;
        const y = roomY + item.position.y * scale;
        const rotation = item.rotation || 0;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);

        const width = item.width * scale;
        const height = item.depth * scale;

        // Draw furniture rectangle
        ctx.fillStyle = item.color;
        ctx.fillRect(-width / 2, -height / 2, width, height);

        // Border and UI Controls
        if (selectedItem === item.id) {
          ctx.strokeStyle = '#4f46e5';
          ctx.lineWidth = 3;
          ctx.strokeRect(-width / 2, -height / 2, width, height);

          // Draw rotation handle
          ctx.beginPath();
          ctx.moveTo(0, -height / 2);
          ctx.lineTo(0, -height / 2 - 25);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, -height / 2 - 25, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
          ctx.strokeRect(-width / 2, -height / 2, width, height);
        }

        // Draw direction indicator (small triangle at front)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.moveTo(0, -height / 2 + 5);
        ctx.lineTo(-8, -height / 2 + 15);
        ctx.lineTo(8, -height / 2 + 15);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // Draw label
        ctx.fillStyle = '#1e293b';
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const labelY = y + (item.depth * scale) / 2 + 5;

        // Background for label to make it readable
        const metrics = ctx.measureText(item.name);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(x - metrics.width / 2 - 2, labelY, metrics.width + 4, 14);

        ctx.fillStyle = '#1e293b';
        ctx.fillText(item.name, x, labelY);
      });
    });

  }, [rooms, activeRoomId, selectedItem, scale, canvasWidth, canvasHeight]);

  const getItemAtPosition = (x: number, y: number): { type: 'furniture', id: string, roomX: number, roomY: number } | { type: 'room', id: string } | null => {
    // Check furniture first (top z-index)
    for (let rIndex = rooms.length - 1; rIndex >= 0; rIndex--) {
      const r = rooms[rIndex];
      const roomX = 200 + (r.room.position?.x || 0) * scale;
      const roomY = 200 + (r.room.position?.z || 0) * scale;
      
      for (let i = r.furniture.length - 1; i >= 0; i--) {
        const item = r.furniture[i];
        if (!item.position) continue;

        const itemX = roomX + item.position.x * scale;
        const itemY = roomY + item.position.y * scale;

        const rotation = item.rotation || 0;
        const isRotated = rotation % 180 === 90;
        const itemWidth = (isRotated ? item.depth : item.width) * scale;
        const itemDepth = (isRotated ? item.width : item.depth) * scale;

        if (
          x >= itemX - itemWidth / 2 &&
          x <= itemX + itemWidth / 2 &&
          y >= itemY - itemDepth / 2 &&
          y <= itemY + itemDepth / 2
        ) {
          return { type: 'furniture', id: item.id, roomX, roomY };
        }
      }
    }

    // Check rooms (click inside room to drag/select it)
    for (let rIndex = rooms.length - 1; rIndex >= 0; rIndex--) {
      const r = rooms[rIndex];
      const roomX = 200 + (r.room.position?.x || 0) * scale;
      const roomY = 200 + (r.room.position?.z || 0) * scale;
      const roomWidth = r.room.width * scale;
      const roomHeight = r.room.length * scale;

      if (x >= roomX && x <= roomX + roomWidth && y >= roomY && y <= roomY + roomHeight) {
        return { type: 'room', id: r.id };
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (selectedItem) {
      const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];
      const item = activeRoom?.furniture.find(f => f.id === selectedItem);
      if (item && item.position) {
        const roomX = 200 + (activeRoom.room.position?.x || 0) * scale;
        const roomY = 200 + (activeRoom.room.position?.z || 0) * scale;
        
        const itemX = roomX + item.position.x * scale;
        const itemY = roomY + item.position.y * scale;
        const rotation = item.rotation || 0;

        // Inverse transform mouse coordinates
        const dx = x - itemX;
        const dy = y - itemY;
        const rad = (-rotation * Math.PI) / 180;
        const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
        const localY = dx * Math.sin(rad) + dy * Math.cos(rad);

        const height = item.depth * scale;
        const handleY = -height / 2 - 25;

        // Hit test for rotation handle (radius 6, test 20 for easier clicking)
        if (Math.abs(localX - 0) <= 20 && Math.abs(localY - handleY) <= 20) {
          setRotatingItem(selectedItem);
          return;
        }
      }
    }

    const itemMatch = getItemAtPosition(x, y);
    if (itemMatch) {
      if (itemMatch.type === 'furniture') {
        const item = rooms.flatMap(r => r.furniture).find(f => f.id === itemMatch.id);
        if (item) {
          setDraggingItem(item.id);
          onSelectItem(item.id);
          
          // If we selected a furniture, ensure its parent room is active
          const parentRoom = rooms.find(r => r.furniture.some(f => f.id === item.id));
          if (parentRoom && parentRoom.id !== activeRoomId) {
            onSelectRoom(parentRoom.id);
          }

          const itemX = itemMatch.roomX + (item.position?.x || 0) * scale;
          const itemY = itemMatch.roomY + (item.position?.y || 0) * scale;

          setDragOffset({
            x: x - itemX,
            y: y - itemY,
          });
        }
      } else if (itemMatch.type === 'room') {
        onSelectItem(null);
        onSelectRoom(itemMatch.id);
        setDraggingRoom(itemMatch.id);
        
        const r = rooms.find(room => room.id === itemMatch.id);
        const roomX = 200 + (r?.room.position?.x || 0) * scale;
        const roomY = 200 + (r?.room.position?.z || 0) * scale;
        setDragOffset({
            x: x - roomX,
            y: y - roomY,
        });
      }
    } else {
      onSelectItem(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];
    if (rotatingItem && onUpdateItemRotation) {
      const item = activeRoom.furniture.find(f => f.id === rotatingItem);
      if (item && item.position) {
        const roomX = 200 + (activeRoom.room.position?.x || 0) * scale;
        const roomY = 200 + (activeRoom.room.position?.z || 0) * scale;
        
        const itemX = roomX + item.position.x * scale;
        const itemY = roomY + item.position.y * scale;

        const dx = x - itemX;
        const dy = y - itemY;

        let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        angle += 90; // Adjust so straight up is 0 degrees

        // Snap to 15 degrees unless shift key is pressed
        if (!e.shiftKey) {
          angle = Math.round(angle / 15) * 15;
        } else {
          angle = Math.round(angle);
        }

        angle = (angle + 360) % 360;
        onUpdateItemRotation(rotatingItem, angle);
      }
      return;
    }

    if (draggingRoom) {
      let newX = (x - dragOffset.x - 200) / scale;
      let newZ = (y - dragOffset.y - 200) / scale;
      
      // Snapping to grid (0.5m)
      if (!e.shiftKey) {
        newX = Math.round(newX * 2) / 2;
        newZ = Math.round(newZ * 2) / 2;
      }
      
      onUpdateRoomPosition(draggingRoom, { x: newX, z: newZ });
      return;
    }

    if (!draggingItem || !onUpdateItemPosition) return;

    const roomX = 200 + (activeRoom.room.position?.x || 0) * scale;
    const roomY = 200 + (activeRoom.room.position?.z || 0) * scale;

    let newX = (x - roomX - dragOffset.x) / scale;
    let newY = (y - roomY - dragOffset.y) / scale;

    // Constrain to room boundaries
    const item = activeRoom.furniture.find(f => f.id === draggingItem);
    if (item) {
      const rotation = item.rotation || 0;
      const isRotated = rotation % 180 === 90;
      const width = isRotated ? item.depth : item.width;
      const depth = isRotated ? item.width : item.depth;

      const halfWidth = width / 2;
      const halfDepth = depth / 2;

      newX = Math.max(halfWidth, Math.min(activeRoom.room.width - halfWidth, newX));
      newY = Math.max(halfDepth, Math.min(activeRoom.room.length - halfDepth, newY));
    }

    onUpdateItemPosition(draggingItem, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDraggingItem(null);
    setRotatingItem(null);
    setDraggingRoom(null);
  };

  const handleMouseLeave = () => {
    setDraggingItem(null);
    setRotatingItem(null);
    setDraggingRoom(null);
  };

  // Find selected furniture and its screen coordinates
  let selectedFurnitureObj = null;
  let selectedFurnitureX = 0;
  let selectedFurnitureY = 0;

  if (selectedItem) {
    const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];
    if (activeRoom) {
      const item = activeRoom.furniture.find(f => f.id === selectedItem);
      if (item && item.position) {
        selectedFurnitureObj = item;
        const roomX = 200 + (activeRoom.room.position?.x || 0) * scale;
        const roomY = 200 + (activeRoom.room.position?.z || 0) * scale;
        selectedFurnitureX = roomX + item.position.x * scale;
        
        const isRotated = (item.rotation || 0) % 180 === 90;
        const visualHeight = isRotated ? item.width : item.depth;
        const labelHeight = 20;
        const padding = 15; 
        selectedFurnitureY = roomY + item.position.y * scale + (visualHeight * scale) / 2 + labelHeight + padding;
      }
    }
  }

  return (
    <div ref={(node) => { drop(node); }} className={`relative inline-block bg-white rounded-lg shadow-lg p-4 transition-colors ${isOver ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="cursor-move"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <div className="mt-3 text-center text-sm text-slate-500">
        Click and drag furniture to reposition • Click empty space to deselect
      </div>

      {selectedFurnitureObj && (
        <div 
          className="absolute z-10 animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            left: `${selectedFurnitureX + 16}px`,
            top: `${selectedFurnitureY + 16}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <Card className="backdrop-blur-xl bg-card/95 border-primary/40 shadow-xl w-auto min-w-[350px]">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-base flex items-center justify-between text-foreground">
                <span>Selected: {selectedFurnitureObj.name}</span>
                <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30">
                  {selectedFurnitureObj.width}m × {selectedFurnitureObj.depth}m
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onUpdateItemRotation) {
                      onUpdateItemRotation(selectedFurnitureObj.id, ((selectedFurnitureObj.rotation || 0) + 90) % 360);
                    }
                  }}
                  className="border-white/20 text-foreground hover:bg-white/10"
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  Rotate 90°
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onRemoveItem) onRemoveItem(selectedFurnitureObj.id);
                  }}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
                <div className="ml-auto text-sm text-muted-foreground whitespace-nowrap">
                  Position: {selectedFurnitureObj.position?.x.toFixed(2)}m, {selectedFurnitureObj.position?.y.toFixed(2)}m
                </div>
              </div>

              {/* Color Picker */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Palette className="w-3.5 h-3.5" />
                  Furniture Color
                </div>

                {/* Preset Swatches */}
                <div className="grid grid-cols-6 gap-1.5">
                  {furnitureColorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      title={preset.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onUpdateItemColor) onUpdateItemColor(selectedFurnitureObj.id, preset.color);
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        selectedFurnitureObj.color === preset.color
                          ? 'border-accent ring-2 ring-accent ring-offset-1 ring-offset-card'
                          : 'border-white/20 hover:border-white/50'
                      }`}
                      style={{ backgroundColor: preset.color }}
                    />
                  ))}
                </div>

                {/* Custom color */}
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedFurnitureObj.color || '#808080'}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (onUpdateItemColor) onUpdateItemColor(selectedFurnitureObj.id, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-9 h-9 rounded cursor-pointer border border-white/20 bg-transparent p-0.5"
                    title="Custom color"
                  />
                  <input
                    type="text"
                    value={selectedFurnitureObj.color || '#808080'}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
                        if (onUpdateItemColor && e.target.value.length === 7) {
                          onUpdateItemColor(selectedFurnitureObj.id, e.target.value);
                        }
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="#RRGGBB"
                    className="flex-1 h-9 px-2 rounded text-xs font-mono bg-black/30 border border-white/20 text-foreground focus:outline-none focus:border-accent"
                  />
                  <div
                    className="w-9 h-9 rounded border border-white/20 flex-shrink-0"
                    style={{ backgroundColor: selectedFurnitureObj.color || '#808080' }}
                    title="Current color"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
