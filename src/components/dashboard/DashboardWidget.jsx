import { MoreVertical, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WIDGET_CONFIG } from './widgetConfig';
import GridSizeSelector from './GridSizeSelector';

export default function DashboardWidget({ 
  widget, 
  children, 
  onRemove, 
  onResize,
}) {
  const config = WIDGET_CONFIG[widget.type];
  const constraints = config?.constraints;

  const handleSizeChange = (newSize) => {
    onResize(widget.id, newSize);
  };

  return (
    <div className="relative group h-full">
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <GridSizeSelector
          currentSize={{ w: widget.w, h: widget.h }}
          onSizeChange={handleSizeChange}
          maxWidth={constraints?.maxW || 4}
          maxHeight={constraints?.maxH || 4}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-sm"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-800 border-slate-700" align="end">
            <DropdownMenuItem
              onClick={() => onRemove(widget.id)}
              className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {children}
    </div>
  );
}