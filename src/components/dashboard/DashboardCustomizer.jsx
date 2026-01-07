import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Plus } from 'lucide-react';
import { WIDGET_CONFIG, DEFAULT_LAYOUT } from './widgetConfig';
import { cn } from "@/lib/utils";

export default function DashboardCustomizer({ open, onClose, layout, onLayoutChange, onReset }) {
  const [localLayout, setLocalLayout] = useState(layout);
  
  // Sync local state when layout prop changes
  useEffect(() => {
    setLocalLayout(layout);
  }, [layout]);

  const handleToggle = (widgetId) => {
    setLocalLayout(prev =>
      prev.map(w => w.id === widgetId ? { ...w, visible: !w.visible } : w)
    );
  };



  const handleRemove = (widgetId) => {
    setLocalLayout(prev =>
      prev.map(w => w.id === widgetId ? { ...w, visible: false } : w)
    );
  };

  const handleAddWidget = (widgetType) => {
    const config = WIDGET_CONFIG[widgetType];
    const newWidget = {
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: widgetType,
      w: config.defaultSize.w,
      h: config.defaultSize.h,
      visible: true,
      x: 0,
      y: 0,
      parentId: null,
    };
    setLocalLayout(prev => [...prev, newWidget]);
  };

  const handleSave = () => {
    onLayoutChange(localLayout);
    onClose();
  };

  const handleResetToDefault = () => {
    setLocalLayout(DEFAULT_LAYOUT);
    onReset();
  };

  const visibleWidgets = localLayout.filter(w => w.visible);
  const availableToAdd = Object.entries(WIDGET_CONFIG).filter(
    ([type]) => {
      // Allow multiple stacked widgets
      if (type === 'stacked') return true;
      return !localLayout.some(w => w.type === type && w.visible);
    }
  );

  const groupedByCategory = visibleWidgets.reduce((acc, widget) => {
    const config = WIDGET_CONFIG[widget.type];
    const category = config?.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(widget);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Customize Dashboard</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToDefault}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Active Widgets */}
            {Object.entries(groupedByCategory).map(([category, widgets]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-2">
                  {widgets.map((widget) => {
                    const config = WIDGET_CONFIG[widget.type];
                    return (
                      <div
                        key={widget.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                      >
                        <Switch
                          checked={widget.visible}
                          onCheckedChange={() => handleToggle(widget.id)}
                        />
                        <div className="flex-1">
                          <Label className="text-white">{config.label}</Label>
                        </div>
                        <Badge variant="outline" className="border-slate-600 text-slate-400">
                          {widget.w}×{widget.h}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Add Widgets */}
            {availableToAdd.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                  Add Widgets
                </h3>
                <div className="space-y-2">
                  {availableToAdd.map(([type, config]) => (
                    <button
                      key={type}
                      onClick={() => handleAddWidget(type)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700 hover:bg-slate-800/50 transition-colors text-left"
                    >
                      <Plus className="w-4 h-4 text-emerald-400" />
                      <span className="text-white">{config.label}</span>
                      <Badge variant="outline" className="ml-auto border-slate-600 text-slate-400 text-xs">
                        {config.category}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t border-slate-800">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}