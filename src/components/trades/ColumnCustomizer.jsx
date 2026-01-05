import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings2, GripVertical } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ColumnCustomizer({ columns, onChange }) {
  const [open, setOpen] = useState(false);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  const handleToggleColumn = (columnId) => {
    const updated = columns.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    );
    onChange(updated);
  };

  const handleReset = () => {
    const reset = columns.map(col => ({ ...col, visible: true }));
    onChange(reset);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="border-slate-700 text-slate-400 hover:text-white">
          <Settings2 className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-slate-900 border-slate-800 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Customize Columns</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-white"
            >
              Reset
            </Button>
          </div>

          <p className="text-xs text-slate-500">
            Drag to reorder, click to show/hide
          </p>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="columns">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {columns.map((column, index) => (
                    <Draggable
                      key={column.id}
                      draggableId={column.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-lg border bg-slate-800/50 transition-colors",
                            snapshot.isDragging ? "border-emerald-500/50 bg-slate-800" : "border-slate-700"
                          )}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <Checkbox
                            checked={column.visible}
                            onCheckedChange={() => handleToggleColumn(column.id)}
                            className="border-slate-600"
                          />
                          <span className={cn(
                            "flex-1 text-sm",
                            column.visible ? "text-white" : "text-slate-500"
                          )}>
                            {column.label}
                          </span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </PopoverContent>
    </Popover>
  );
}