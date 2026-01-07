import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Plus } from 'lucide-react';
import { WIDGET_CONFIG } from './widgetConfig';

export default function StackedWidget({ 
  widget, 
  children = [], 
  renderWidget, 
  onDrop,
  onRemoveChild,
  onReorderChildren 
}) {
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  
  const maxChildren = 4;
  const isFull = children.length >= maxChildren;
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const widgetData = e.dataTransfer.getData('application/json');
    if (!widgetData) return;
    
    try {
      const draggedWidget = JSON.parse(widgetData);
      const config = WIDGET_CONFIG[draggedWidget.type];
      
      if (!config?.stackable || isFull) {
        e.dataTransfer.dropEffect = 'none';
        return;
      }
      
      setIsDraggingOver(true);
      e.dataTransfer.dropEffect = 'move';
    } catch (err) {
      e.dataTransfer.dropEffect = 'none';
    }
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    setDragOverIndex(null);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    setDragOverIndex(null);
    
    if (isFull) return;
    
    const widgetData = e.dataTransfer.getData('application/json');
    if (widgetData) {
      try {
        const draggedWidget = JSON.parse(widgetData);
        const config = WIDGET_CONFIG[draggedWidget.type];
        
        if (!config?.stackable) {
          console.log('Widget not stackable:', draggedWidget.type);
          return;
        }
        
        console.log('Dropping widget into stack:', draggedWidget);
        onDrop?.(widget.id, draggedWidget);
      } catch (err) {
        console.error('Failed to parse dropped widget:', err);
      }
    }
  };
  
  const handleChildDragStart = (e, childWidget, index) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      ...childWidget,
      fromStackedId: widget.id,
      fromIndex: index
    }));
  };
  
  const handleChildDragOver = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(index);
  };
  
  const handleChildDrop = (e, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
    
    const widgetData = e.dataTransfer.getData('application/json');
    if (widgetData) {
      try {
        const draggedWidget = JSON.parse(widgetData);
        
        // Check if reordering within same container
        if (draggedWidget.fromStackedId === widget.id) {
          onReorderChildren?.(widget.id, draggedWidget.fromIndex, targetIndex);
        }
      } catch (err) {
        console.error('Failed to parse dropped widget:', err);
      }
    }
  };
  
  if (children.length === 0) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "bg-slate-900/50 border-2 border-dashed rounded-2xl h-full flex flex-col items-center justify-center text-center p-4 transition-all",
          isDraggingOver ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700"
        )}
      >
        <Plus className="w-6 h-6 text-slate-500 mb-2" />
        <p className="text-xs text-slate-500">Drop up to 4 widgets here</p>
      </div>
    );
  }
  
  const heightPerChild = 100 / children.length;
  
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "bg-slate-900/50 border border-slate-800/50 rounded-2xl h-full flex flex-col overflow-hidden transition-all",
        isDraggingOver && !isFull && "border-emerald-500 bg-emerald-500/5"
      )}
    >
      {children.map((child, index) => (
        <div
          key={child.id}
          draggable
          onDragStart={(e) => handleChildDragStart(e, child, index)}
          onDragOver={(e) => handleChildDragOver(e, index)}
          onDrop={(e) => handleChildDrop(e, index)}
          style={{ height: `${heightPerChild}%` }}
          className={cn(
            "flex-shrink-0 relative cursor-move",
            index < children.length - 1 && "border-b border-slate-800/50",
            dragOverIndex === index && "bg-emerald-500/10"
          )}
        >
          {renderWidget(child, 'stacked')}
        </div>
      ))}
      
      {!isFull && (
        <div className="absolute bottom-2 right-2 pointer-events-none">
          <div className="text-xs text-slate-600 bg-slate-900/80 px-2 py-1 rounded">
            {children.length}/4
          </div>
        </div>
      )}
    </div>
  );
}