import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Grid3x3 } from "lucide-react";

export default function GridSizeSelector({ currentSize, onSizeChange, maxWidth = 4, maxHeight = 4 }) {
  const { w, h } = currentSize;

  const handleCellClick = (newW, newH) => {
    onSizeChange({ w: newW, h: newH });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-slate-700"
        >
          <Grid3x3 className="w-4 h-4 mr-2" />
          {w}×{h}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 bg-slate-800 border-slate-700" align="end">
        <div className="space-y-2">
          <p className="text-xs text-slate-400 font-medium">Select Size (Width × Height)</p>
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${maxWidth}, 1fr)` }}>
            {Array.from({ length: maxHeight }, (_, rowIndex) => {
              const cellH = rowIndex + 1;
              return Array.from({ length: maxWidth }, (_, colIndex) => {
                const cellW = colIndex + 1;
                const isSelected = w === cellW && h === cellH;
                
                return (
                  <button
                    key={`${cellW}-${cellH}`}
                    onClick={() => handleCellClick(cellW, cellH)}
                    className={cn(
                      "w-10 h-10 rounded border-2 transition-all text-xs font-medium",
                      "hover:border-emerald-500 hover:bg-emerald-500/20",
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/30 text-white"
                        : "border-slate-600 bg-slate-700/50 text-slate-400"
                    )}
                  >
                    {cellW}×{cellH}
                  </button>
                );
              });
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}