import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { FurnitureItem } from '../../lib/design-context';
import { ImageWithFallback } from '../ui/image-with-fallback';
import { useDrag } from 'react-dnd';

interface FurnitureLibraryItemProps {
  item: Omit<FurnitureItem, 'id' | 'position' | 'rotation'>;
  onAdd: () => void;
}

export function FurnitureLibraryItem({ item, onAdd }: FurnitureLibraryItemProps) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'furniture',
    item: { ...item },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={dragRef as unknown as React.Ref<HTMLDivElement>}
      className={`flex items-center gap-3 p-3 backdrop-blur-xl bg-card/60 border border-white/20 rounded-lg hover:border-accent/40 hover:bg-card/80 transition-all shadow-md hover:shadow-lg group ${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}`}
      onClick={onAdd}
    >
      {item.imageUrl ? (
        <ImageWithFallback
          src={item.imageUrl}
          alt={item.name}
          className="w-16 h-16 rounded object-cover border border-white/20 shadow-sm flex-shrink-0"
        />
      ) : (
        <div
          className="w-16 h-16 rounded flex-shrink-0 border border-white/20 shadow-sm"
          style={{ backgroundColor: item.color }}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-foreground truncate">
          {item.name}
        </div>
        <div className="text-xs text-muted-foreground">
          {item.width}m × {item.depth}m × {item.height}m
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        className="flex-shrink-0 hover:bg-primary/20 hover:text-accent opacity-70 group-hover:opacity-100 transition-opacity"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
