import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  X, 
  MoreVertical, 
  Trash2, 
  Edit2,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Tag,
  Star,
  FileText
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

const JOURNAL_TYPE_CONFIG = {
  TRADE: { label: 'Trade Journal', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  DAY: { label: 'Daily Journal', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  GENERAL: { label: 'General', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' }
};

const EMOTION_MAP = {
  neutral: { emoji: '😐', label: 'Neutral' },
  anxious: { emoji: '😬', label: 'Anxious' },
  frustrated: { emoji: '😤', label: 'Frustrated' },
  angry: { emoji: '😡', label: 'Angry' },
  confident: { emoji: '😄', label: 'Confident' },
  calm: { emoji: '😎', label: 'Calm' },
  greedy: { emoji: '🤑', label: 'Greedy' },
  fearful: { emoji: '😨', label: 'Fearful' },
  overwhelmed: { emoji: '🤯', label: 'Overwhelmed' }
};

const DAY_MOOD_MAP = {
  great: { emoji: '😄', label: 'Great' },
  good: { emoji: '🙂', label: 'Good' },
  neutral: { emoji: '😐', label: 'Neutral' },
  off: { emoji: '😕', label: 'Off' },
  bad: { emoji: '😣', label: 'Bad' }
};

const POSITIVE_TRAIT_LABELS = {
  PATIENT: 'Patient',
  DISCIPLINED: 'Disciplined',
  FOLLOWED_PLAN: 'Followed Plan',
  GOOD_RISK_MANAGEMENT: 'Good Risk Management',
  PERFECT_ENTRY: 'Perfect Entry',
  GOOD_EXIT: 'Good Exit',
  LET_WINNER_RUN: 'Let Winner Run',
  CUT_LOSS_QUICKLY: 'Cut Loss Quickly'
};

const NEGATIVE_TRAIT_LABELS = {
  FOMO: 'FOMO',
  ENTERED_LATE: 'Entered Late',
  OVERTRADING: 'Overtrading',
  REVENGE_TRADE: 'Revenge Trade',
  MOVED_STOP_BADLY: 'Moved Stop Badly',
  NO_STOP: 'No Stop',
  HESITATED: 'Hesitated',
  TOOK_PROFIT_TOO_EARLY: 'Took Profit Too Early',
  ADDED_TO_LOSER: 'Added to Loser',
  BROKE_RULES: 'Broke Rules'
};

export default function JournalDetailView({ journal, open, onClose, onEdit, onDelete }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { data: strategy } = useQuery({
    queryKey: ['strategy', journal?.strategy_id],
    queryFn: () => base44.entities.Strategy.filter({ id: journal.strategy_id }),
    enabled: !!journal?.strategy_id,
    select: (data) => data[0]
  });

  const { data: linkedTrades = [] } = useQuery({
    queryKey: ['linked-trades', journal?.linked_trade_ids],
    queryFn: async () => {
      if (!journal?.linked_trade_ids || journal.linked_trade_ids.length === 0) return [];
      const trades = await Promise.all(
        journal.linked_trade_ids.map(id => 
          base44.entities.Trade.filter({ id }).then(res => res[0])
        )
      );
      return trades.filter(Boolean);
    },
    enabled: !!journal?.linked_trade_ids && journal.linked_trade_ids.length > 0
  });

  if (!journal) return null;

  const journalType = journal.journal_type || 'GENERAL';
  const typeConfig = JOURNAL_TYPE_CONFIG[journalType];

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete(journal);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] p-0">
          <ScrollArea className="max-h-[90vh]">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={typeConfig.color}>
                      {typeConfig.label}
                    </Badge>
                    <span className="text-slate-400 text-sm">
                      {format(new Date(journal.date), 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  {journal.title && (
                    <h2 className="text-2xl font-bold text-white">{journal.title}</h2>
                  )}
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
                {/* Linked Trades */}
                {linkedTrades.length > 0 && (
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">
                      Linked Trades ({linkedTrades.length})
                    </p>
                    <div className="space-y-2">
                      {linkedTrades.map((trade) => (
                        <div 
                          key={trade.id}
                          className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                              trade.trade_type === 'long' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                            )}>
                              {trade.symbol.slice(0, 3)}
                            </div>
                            <div>
                              <p className="font-medium text-white">{trade.symbol}</p>
                              <p className="text-xs text-slate-400">
                                {format(new Date(trade.entry_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          {trade.profit_loss !== null && trade.profit_loss !== undefined && (
                            <span className={cn(
                              "font-bold",
                              trade.profit_loss >= 0 ? "text-emerald-400" : "text-red-400"
                            )}>
                              {trade.profit_loss >= 0 ? '+' : ''}${trade.profit_loss.toFixed(2)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategy & Keywords */}
                {(strategy || journal.keywords?.length > 0) && (
                  <div className="space-y-2">
                    {strategy && (
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-slate-400">Strategy:</span>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          {strategy.name}
                        </Badge>
                      </div>
                    )}
                    {journal.keywords?.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-400">Keywords:</span>
                        {journal.keywords.map((keyword, idx) => (
                          <Badge key={idx} className="bg-slate-700/50 text-slate-200 border-slate-600">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Day Journal Specific Fields */}
                {journalType === 'DAY' && (
                  <>
                    {(journal.day_performance_rating || journal.day_mood) && (
                      <div className="flex gap-3">
                        {journal.day_performance_rating && (
                          <div className="flex-1 bg-slate-800/30 rounded-xl p-4">
                            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Performance Rating</p>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "w-5 h-5",
                                    star <= journal.day_performance_rating ? "fill-emerald-400 text-emerald-400" : "text-slate-600"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {journal.day_mood && (
                          <div className="flex-1 bg-slate-800/30 rounded-xl p-4">
                            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Day Mood</p>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{DAY_MOOD_MAP[journal.day_mood]?.emoji}</span>
                              <span className="text-white font-medium">{DAY_MOOD_MAP[journal.day_mood]?.label}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {journal.day_notes_what_worked && (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                        <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide mb-2">
                          What Worked Today
                        </h3>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{journal.day_notes_what_worked}</p>
                      </div>
                    )}

                    {journal.day_notes_what_to_improve && (
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                        <h3 className="text-sm font-medium text-amber-400 uppercase tracking-wide mb-2">
                          What Needs Improvement
                        </h3>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{journal.day_notes_what_to_improve}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Trade Journal Specific Fields */}
                {journalType === 'TRADE' && (
                  <>
                    {(journal.execution_rating || journal.emotion) && (
                      <div className="flex gap-3">
                        {journal.execution_rating && (
                          <div className="flex-1 bg-slate-800/30 rounded-xl p-4">
                            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Execution Rating</p>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "w-5 h-5",
                                    star <= journal.execution_rating ? "fill-amber-400 text-amber-400" : "text-slate-600"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {journal.emotion && (
                          <div className="flex-1 bg-slate-800/30 rounded-xl p-4">
                            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Emotional State</p>
                            {journal.emotion !== 'other' ? (
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{EMOTION_MAP[journal.emotion]?.emoji}</span>
                                <span className="text-white font-medium">{EMOTION_MAP[journal.emotion]?.label}</span>
                              </div>
                            ) : (
                              <span className="text-white">{journal.emotion_other}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {(journal.positive_traits?.length > 0 || journal.negative_traits?.length > 0) && (
                      <div className="space-y-3">
                        {journal.positive_traits?.length > 0 && (
                          <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Positive Traits</p>
                            <div className="flex flex-wrap gap-2">
                              {journal.positive_traits.map((trait, idx) => (
                                <Badge key={idx} className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                  {POSITIVE_TRAIT_LABELS[trait]}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {journal.negative_traits?.length > 0 && (
                          <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Negative Traits</p>
                            <div className="flex flex-wrap gap-2">
                              {journal.negative_traits.map((trait, idx) => (
                                <Badge key={idx} className="bg-red-500/20 text-red-300 border-red-500/30">
                                  {NEGATIVE_TRAIT_LABELS[trait]}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {(journal.stop_loss_outcome || journal.take_profit_outcome) && (
                      <div className="bg-slate-800/30 rounded-xl p-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Trade Outcome</p>
                        {journal.stop_loss_outcome && (
                          <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                            Stop Loss: {journal.stop_loss_outcome.replace(/_/g, ' ')}
                          </Badge>
                        )}
                        {journal.take_profit_outcome && (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                            Take Profit: {journal.take_profit_outcome.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                    )}
                  </>
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

                {/* Content */}
                {journal.content && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-2">
                      {journalType === 'DAY' ? 'Plan for Tomorrow' : journalType === 'TRADE' ? 'Trade Notes' : 'Notes'}
                    </h3>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{journal.content}</p>
                  </div>
                )}

                {/* Legacy fields for backward compatibility */}
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
            </div>
          </ScrollArea>
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