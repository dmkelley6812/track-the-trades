import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useState } from 'react';

export default function StrategyDetailView({ strategy, open, onOpenChange, onEdit, onDelete }) {
  const [lightboxImage, setLightboxImage] = useState(null);

  if (!strategy) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <DialogTitle className="text-2xl text-white">{strategy.name}</DialogTitle>
              {!strategy.is_system_strategy && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(strategy)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(strategy)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            {strategy.is_system_strategy && (
              <div className="inline-flex items-center px-2 py-1 rounded bg-slate-800 text-xs text-slate-400 w-fit">
                System Strategy
              </div>
            )}
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {strategy.description && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Description
                </h3>
                <p className="text-slate-300 leading-relaxed">{strategy.description}</p>
              </div>
            )}

            {strategy.guidelines && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Guidelines & Rules
                </h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {strategy.guidelines}
                </p>
              </div>
            )}

            {strategy.images?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Screenshots & Examples
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {strategy.images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxImage(img.url)}
                      className="relative group cursor-pointer overflow-hidden rounded-lg border border-slate-700 hover:border-emerald-500/50 transition-colors"
                    >
                      <img
                        src={img.url}
                        alt={img.filename}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={lightboxImage}
            alt="Strategy screenshot"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}