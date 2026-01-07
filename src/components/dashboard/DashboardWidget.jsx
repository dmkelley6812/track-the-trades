import { MoreVertical, Trash2, Grid3x3, GripVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { WIDGET_CONFIG } from './widgetConfig';

export default function DashboardWidget({ 
  widget, 
  children, 
  onRemove, 
  onResize,
  layoutMode = 'default',
}) {
  const config = WIDGET_CONFIG[widget.type];
  const constraints = config?.constraints;

  // Generate available sizes based on constraints
  const availableSizes = [];
  const minW = constraints?.minW || 1;
  const maxW = constraints?.maxW || 4;
  const minH = constraints?.minH || 1;
  const maxH = constraints?.maxH || 4;

  for (let h = minH; h <= maxH; h++) {
    for (let w = minW; w <= maxW; w++) {
      availableSizes.push({ w, h, label: `${w}×${h}` });
    }
  }

  return (
    <div 
      className="relative group h-full"
      draggable={layoutMode === 'default'}
      onDragStart={(e) => {
        if (layoutMode === 'default') {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('application/json', JSON.stringify(widget));
          e.dataTransfer.setData('text/plain', widget.id);
        }
      }}
    >
      {layoutMode === 'default' && (
        <>
          <div className="absolute top-2 left-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity widget-drag-handle cursor-move">
            <div className="h-8 w-8 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <GripVertical className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div className="absolute top-2 right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={(e) => e.stopPropagation()}>
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
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-white hover:bg-slate-700">
                <Grid3x3 className="w-4 h-4 mr-2" />
                Widget Size
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-slate-800 border-slate-700">
                {availableSizes.map((size) => (
                  <DropdownMenuItem
                    key={size.label}
                    onClick={() => onResize(widget.id, { w: size.w, h: size.h })}
                    className="text-white hover:bg-slate-700"
                  >
                    {size.label}
                    {widget.w === size.w && widget.h === size.h && (
                      <span className="ml-2 text-emerald-400">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem
              onClick={() => onRemove(widget.id)}
              className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Widget
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
        </>
      )}
      {children}
    </div>
  );
}