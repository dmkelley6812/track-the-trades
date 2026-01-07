import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Plus, X } from 'lucide-react';
import { WIDGET_CONFIG } from './widgetConfig';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function StackedWidget({ 
  widget, 
  children = [], 
  renderWidget, 
  onAddWidget,
  onRemoveChild,
  availableWidgets = []
}) {
  const maxSlots = 4;
  
  // Create array of 4 slots, filled with children or null
  const slots = Array.from({ length: maxSlots }, (_, i) => children[i] || null);
  
  const handleChildDragStart = (e, childWidget) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      ...childWidget,
      fromStackedId: widget.id,
    }));
  };
  
  const heightPerSlot = 100 / maxSlots;
  
  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl h-full flex flex-col overflow-hidden">
      {slots.map((child, index) => (
        <div
          key={child?.id || `empty-${index}`}
          style={{ height: `${heightPerSlot}%` }}
          className={cn(
            "flex-shrink-0 relative",
            index < maxSlots - 1 && "border-b border-slate-800/50"
          )}
        >
          {child ? (
            <>
              <div
                draggable
                onDragStart={(e) => handleChildDragStart(e, child)}
                className="h-full cursor-move"
              >
                {renderWidget(child, 'stacked')}
              </div>
              <button
                onClick={() => onRemoveChild?.(widget.id, child.id)}
                className="absolute top-1 right-1 z-10 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
              >
                <div className="h-5 w-5 bg-slate-800/90 hover:bg-red-500/90 rounded flex items-center justify-center">
                  <X className="w-3 h-3 text-slate-400 hover:text-white" />
                </div>
              </button>
            </>
          ) : (
            <div className="h-full flex items-center justify-center bg-slate-800/20 hover:bg-slate-800/40 transition-all">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-emerald-400 hover:bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Widget
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-700" align="center">
                  {availableWidgets.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-slate-500">
                      No stackable widgets available
                    </div>
                  ) : (
                    availableWidgets.map(([type, config]) => (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => onAddWidget?.(widget.id, type)}
                        className="text-white hover:bg-slate-700 cursor-pointer"
                      >
                        {config.label}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}