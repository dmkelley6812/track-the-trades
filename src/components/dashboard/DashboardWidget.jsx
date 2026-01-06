import { MoreVertical, Trash2, Minimize2, Square, Maximize2 } from 'lucide-react';
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
import { WIDGET_CONFIG, WIDGET_SIZES } from './widgetConfig';

export default function DashboardWidget({ 
  widget, 
  children, 
  onRemove, 
  onResize,
}) {
  const config = WIDGET_CONFIG[widget.type];
  const canResize = config?.allowedSizes?.length > 1;

  const getSizeIcon = (size) => {
    switch (size) {
      case WIDGET_SIZES.SMALL:
        return <Minimize2 className="w-4 h-4 mr-2" />;
      case WIDGET_SIZES.MEDIUM_TALL:
        return <Square className="w-4 h-4 mr-2" />;
      case WIDGET_SIZES.MEDIUM_SQUARE:
        return <Square className="w-4 h-4 mr-2" />;
      case WIDGET_SIZES.LARGE:
        return <Maximize2 className="w-4 h-4 mr-2" />;
      default:
        return null;
    }
  };

  const getSizeLabel = (size) => {
    switch (size) {
      case WIDGET_SIZES.SMALL:
        return 'Small';
      case WIDGET_SIZES.MEDIUM_TALL:
        return 'Medium (Tall)';
      case WIDGET_SIZES.MEDIUM_SQUARE:
        return 'Medium (Square)';
      case WIDGET_SIZES.LARGE:
        return 'Large';
      default:
        return size;
    }
  };

  return (
    <div className="relative group h-full">
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
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
            {canResize && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-white hover:bg-slate-700">
                  Resize
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-slate-800 border-slate-700">
                  {config.allowedSizes.map((size) => (
                    <DropdownMenuItem
                      key={size}
                      onClick={() => onResize(widget.id, size)}
                      className="text-white hover:bg-slate-700"
                      disabled={widget.size === size}
                    >
                      {getSizeIcon(size)}
                      {getSizeLabel(size)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
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