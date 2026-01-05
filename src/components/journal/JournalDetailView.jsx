import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { 
  X, 
  MoreVertical, 
  Trash2, 
  Edit2,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart2
} from 'lucide-react';

const MOOD_ICONS = {
  confident: '😎',
  focused: '🎯',
  neutral: '😐',
  anxious: '😰',
  frustrated: '😤'
};

export default function JournalDetailView({ journal, open, onClose, onEdit, onDelete }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  if (!journal) return null;

  const isProfit = journal.daily_pnl > 0;
  const isLoss = journal.daily_pnl < 0;

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete(journal);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{MOOD_ICONS[journal.mood] || '📝'}</div>
              <div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(journal.date), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                {journal.title && (
                  <h2 className="text-xl font-bold text-white mt-1">{journal.title}</h2>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                  <DropdownMenuItem 
                    onClick={() => {
                      onEdit(journal);
                      onClose();
                    }}
                    className="text-white hover:bg-slate-700 cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Entry
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Entry
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-6 py-4">
            {/* Stats */}
            {(journal.daily_pnl !== null || journal.trades_count !== null) && (
              <div className="flex gap-3">
                {journal.daily_pnl !== null && (
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl flex-1",
                    isProfit ? "bg-emerald-500/10 border border-emerald-500/30" : 
                    isLoss ? "bg-red-500/10 border border-red-500/30" : 
                    "bg-slate-800/50 border border-slate-700"
                  )}>
                    {isProfit ? (
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    ) : isLoss ? (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    ) : null}
                    <div>
                      <p className="text-xs text-slate-400">Daily P&L</p>
                      <p className={cn(
                        "font-bold text-lg",
                        isProfit ? "text-emerald-400" : isLoss ? "text-red-400" : "text-slate-400"
                      )}>
                        {isProfit ? '+' : ''}${journal.daily_pnl?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
                {journal.trades_count !== null && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700">
                    <BarChart2 className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Trades</p>
                      <p className="font-bold text-lg text-white">{journal.trades_count}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Images Gallery */}
            {journal.images?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3">
                  Images ({journal.images.length})
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {journal.images.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(image)}
                      className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 group cursor-pointer"
                    >
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content Sections */}
            {journal.content && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-2">
                  Daily Reflection
                </h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{journal.content}</p>
              </div>
            )}

            {journal.market_conditions && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-2">
                  Market Conditions
                </h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{journal.market_conditions}</p>
              </div>
            )}

            {journal.lessons_learned && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-2">
                  Lessons Learned
                </h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{journal.lessons_learned}</p>
              </div>
            )}

            {journal.goals_for_tomorrow && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-2">
                  Goals for Tomorrow
                </h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{journal.goals_for_tomorrow}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="bg-slate-900 border-slate-800 max-w-5xl p-2">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-800 rounded-lg z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.filename}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete journal entry?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. This will permanently delete your journal entry
              {journal.images?.length > 0 && ` and ${journal.images.length} attached image${journal.images.length > 1 ? 's' : ''}`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}