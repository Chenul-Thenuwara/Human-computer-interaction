import { useRef, useEffect, useState } from 'react';
import { Room, FurnitureItem } from '../../lib/design-context';

interface FloorPlanProps {
  room: Room;
  furniture: FurnitureItem[];
  selectedItem: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdatePosition: (id: string, position: { x: number; y: number }) => void;
}

export function FloorPlan({ room, furniture, selectedItem, onSelectItem, onUpdatePosition }: FloorPlanProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const scale = 60; // pixels per meter

  const canvasWidth = room.width * scale + 100;
  const canvasHeight = room.length * scale + 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw room
    const roomX = 50;
    const roomY = 50;
    const roomWidth = room.width * scale;
    const roomHeight = room.length * scale;

    // Room background
    ctx.fillStyle = room.floorColor;
    ctx.fillRect(roomX, roomY, roomWidth, roomHeight);

    // Room border
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.strokeRect(roomX, roomY, roomWidth, roomHeight);

    // Grid lines
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.3)'; // Lighter grid for better visibility on dark themes
    ctx.lineWidth = 1;
    for (let i = 1; i < room.width; i++) {
      ctx.beginPath();
      ctx.moveTo(roomX + i * scale, roomY);
      ctx.lineTo(roomX + i * scale, roomY + roomHeight);
      ctx.stroke();
    }
    for (let i = 1; i < room.length; i++) {
      ctx.beginPath();
      ctx.moveTo(roomX, roomY + i * scale);
      ctx.lineTo(roomX + roomWidth, roomY + i * scale);
      ctx.stroke();
    }

    // Draw furniture
    furniture.forEach((item) => {
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

      // Border
      if (selectedItem === item.id) {
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
      }
      ctx.strokeRect(-width / 2, -height / 2, width, height);

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

    // Draw dimensions
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Width dimension
    ctx.fillText(`${room.width}m`, roomX + roomWidth / 2, roomY - 20);
    
    // Length dimension
    ctx.save();
    ctx.translate(roomX - 20, roomY + roomHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${room.length}m`, 0, 0);
    ctx.restore();
  }, [room, furniture, selectedItem, scale]);

  const getItemAtPosition = (x: number, y: number): FurnitureItem | null => {
    const roomX = 50;
    const roomY = 50;

    for (let i = furniture.length - 1; i >= 0; i--) {
      const item = furniture[i];
      if (!item.position) continue;

      const itemX = roomX + item.position.x * scale;
      const itemY = roomY + item.position.y * scale;
      const width = item.width * scale;
      const height = item.depth * scale;

      // Simple bounding box check (not accounting for rotation for simplicity)
      if (
        x >= itemX - width / 2 &&
        x <= itemX + width / 2 &&
        y >= itemY - height / 2 &&
        y <= itemY + height / 2
      ) {
        return item;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const item = getItemAtPosition(x, y);
    if (item) {
      setDraggingItem(item.id);
      onSelectItem(item.id);
      
      const roomX = 50;
      const roomY = 50;
      const itemX = roomX + (item.position?.x || 0) * scale;
      const itemY = roomY + (item.position?.y || 0) * scale;
      
      setDragOffset({
        x: x - itemX,
        y: y - itemY,
      });
    } else {
      onSelectItem(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingItem) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const roomX = 50;
    const roomY = 50;

    let newX = (x - roomX - dragOffset.x) / scale;
    let newY = (y - roomY - dragOffset.y) / scale;

    // Constrain to room boundaries
    const item = furniture.find(f => f.id === draggingItem);
    if (item) {
      const halfWidth = item.width / 2;
      const halfDepth = item.depth / 2;
      
      newX = Math.max(halfWidth, Math.min(room.width - halfWidth, newX));
      newY = Math.max(halfDepth, Math.min(room.length - halfDepth, newY));
    }

    onUpdatePosition(draggingItem, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDraggingItem(null);
  };

  const handleMouseLeave = () => {
    setDraggingItem(null);
  };

  return (
    <div className="inline-block bg-white rounded-lg shadow-lg p-4">
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
    </div>
  );
}
