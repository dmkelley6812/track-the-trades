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
  onAddChild,
  onRemoveChild,
  availableStackableWidgets = []
}) {
  const maxChildren = 4;
  
  // Create array of 4 slots
  const slots = Array.from({ length: maxChildren }, (_, index) => children[index] || null);
  
  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl h-full flex flex-col overflow-hidden">
      {slots.map((child, index) => (
        <div
          key={child?.id || `empty-${index}`}
          className={cn(
            "flex-1 relative",
            index < maxChildren - 1 && "border-b border-slate-800/50"
          )}
        >
          {child ? (
            <div className="h-full group/child relative">
              {renderWidget(child, 'stacked')}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveChild(widget.id, child.id)}
                className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover/child:opacity-100 transition-opacity bg-slate-800/80 hover:bg-red-500/20 hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Widget
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-700">
                  {availableStackableWidgets.length > 0 ? (
                    availableStackableWidgets.map(([type, config]) => (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => onAddChild(widget.id, type)}
                        className="text-white hover:bg-slate-700"
                      >
                        {config.label}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled className="text-slate-500">
                      No widgets available
                    </DropdownMenuItem>
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