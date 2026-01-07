import { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Tag, 
  Edit2, 
  Trash2,
  FileText,
  Clock,
  Target,
  Star,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

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

const STOP_LOSS_OUTCOMES = {
  NO_STOP_USED: 'No Stop Used',
  STOP_USED_APPROPRIATE: 'Stop Used Appropriately',
  STOP_TOO_TIGHT: 'Stop Too Tight',
  STOP_TOO_WIDE: 'Stop Too Wide',
  MOVED_STOP_BADLY: 'Moved Stop Badly',
  UNKNOWN: 'Unknown'
};

const TAKE_PROFIT_OUTCOMES = {
  TARGET_HIT: 'Target Hit',
  EXITED_TOO_SOON: 'Exited Too Soon',
  MOVED_STOP_TOO_SOON_TAKEN_OUT: 'Moved Stop Too Soon/Taken Out',
  SCALED_OUT_WELL: 'Scaled Out Well',
  LET_WINNER_RUN: 'Let Winner Run',
  UNKNOWN: 'Unknown'
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

export default function TradeDetailModal({ trade, open, onClose, onEdit, onDelete }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageLightbox, setShowImageLightbox] = useState(false);

  const { data: strategy } = useQuery({
    queryKey: ['strategy', trade?.strategy_id],
    queryFn: () => base44.entities.Strategy.filter({ id: trade.strategy_id }),
    enabled: !!trade?.strategy_id,
    select: (data) => data[0]
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ['journal-by-trade', trade?.id],
    queryFn: async () => {
      if (!trade?.id) return [];
      const allJournals = await base44.entities.Journal.list();
      return allJournals.filter(j => j.linked_trade_ids?.includes(trade.id));
    },
    enabled: !!trade?.id
  });

  if (!trade) return null;

  const isWin = trade.profit_loss > 0;
  const isLoss = trade.profit_loss < 0;
  const hasScreenshots = trade.screenshots && trade.screenshots.length > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] p-0">
          <ScrollArea className="max-h-[90vh]">
            <div className="p-6">
              <DialogHeader className="mb-4">
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      trade.trade_type === 'long' ? "bg-emerald-500/20" : "bg-red-500/20"
                    )}>
                      {trade.trade_type === 'long' ? (
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{trade.symbol}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className={cn(
                          "text-xs capitalize",
                          trade.trade_type === 'long' ? "border-emerald-500/50 text-emerald-400" : "border-red-500/50 text-red-400"
                        )}>
                          {trade.trade_type}
                        </Badge>
                        {trade.status === 'open' && (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-xs">
                            Open
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Screenshots Section */}
                {hasScreenshots && (
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-slate-300">Screenshots</p>
                      <Badge variant="outline" className="text-xs">
                        {trade.screenshots.length}
                      </Badge>
                    </div>
                    <div 
                      className="relative aspect-video bg-slate-950 rounded-lg overflow-hidden cursor-pointer mb-3"
                      onClick={() => setShowImageLightbox(true)}
                    >
                      <img 
                        src={trade.screenshots[selectedImageIndex]?.url} 
                        alt="Trade screenshot"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {trade.screenshots.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {trade.screenshots.map((screenshot, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={cn(
                              "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                              selectedImageIndex === idx ? "border-emerald-500" : "border-slate-700 opacity-50 hover:opacity-100"
                            )}
                          >
                            <img 
                              src={screenshot.url} 
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* P&L Display */}
                {trade.status === 'closed' && trade.profit_loss !== null && (
                  <div className={cn(
                    "p-4 rounded-xl",
                    isWin ? "bg-emerald-500/10 border border-emerald-500/30" : 
                    isLoss ? "bg-red-500/10 border border-red-500/30" : 
                    "bg-slate-800/50 border border-slate-700"
                  )}>
                    <div className="text-center mb-3">
                      <p className="text-sm text-slate-400 mb-1">Net P&L</p>
                      <p className={cn(
                        "text-3xl font-bold",
                        isWin ? "text-emerald-400" : isLoss ? "text-red-400" : "text-slate-400"
                      )}>
                        {isWin ? '+' : ''}${trade.profit_loss?.toFixed(2)}
                        {trade.profit_loss_percent !== undefined && trade.profit_loss_percent !== null && (
                          <span className="text-lg ml-2">
                            ({trade.profit_loss_percent >= 0 ? '+' : ''}{trade.profit_loss_percent?.toFixed(2)}%)
                          </span>
                        )}
                      </p>
                    </div>
                    {trade.profit_loss_gross !== undefined && trade.profit_loss_gross !== null && (
                      <div className="flex justify-between text-sm border-t border-slate-700/50 pt-3">
                        <div>
                          <p className="text-slate-500">Gross P&L</p>
                          <p className={cn(
                            "font-medium",
                            trade.profit_loss_gross >= 0 ? "text-emerald-400" : "text-red-400"
                          )}>
                            {trade.profit_loss_gross >= 0 ? '+' : ''}${trade.profit_loss_gross?.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-500">Commissions</p>
                          <p className="font-medium text-slate-400">-${(trade.fees || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Trade Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/30 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Entry Price</p>
                    <p className="font-semibold">${trade.entry_price}</p>
                  </div>
                  {trade.exit_price && (
                    <div className="bg-slate-800/30 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-1">Exit Price</p>
                      <p className="font-semibold">${trade.exit_price}</p>
                    </div>
                  )}
                  <div className="bg-slate-800/30 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Quantity</p>
                    <p className="font-semibold">{trade.quantity}</p>
                  </div>
                  {trade.fees > 0 && (
                    <div className="bg-slate-800/30 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-1">Fees</p>
                      <p className="font-semibold">${trade.fees}</p>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-400">Entry:</span>
                    <span className="text-white">
                      {format(new Date(trade.entry_date), 'MMM d, yyyy • h:mm a')}
                    </span>
                  </div>
                  {trade.exit_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-400">Exit:</span>
                      <span className="text-white">
                        {format(new Date(trade.exit_date), 'MMM d, yyyy • h:mm a')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Strategy & Keywords */}
                {(strategy || trade.keywords?.length > 0) && (
                  <div className="space-y-2">
                    {strategy && (
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-slate-400">Strategy:</span>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                          {strategy.name}
                        </Badge>
                      </div>
                    )}
                    {trade.keywords?.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-400">Keywords:</span>
                        {trade.keywords.map((keyword, idx) => (
                          <Badge key={idx} className="bg-slate-700/50 text-slate-200 border-slate-600 text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Outcome Classification */}
                {trade.status === 'closed' && trade.profit_loss !== 0 && (
                  <>
                    {isLoss && trade.stop_loss_outcome && (
                      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Stop Loss Outcome</p>
                        <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                          {STOP_LOSS_OUTCOMES[trade.stop_loss_outcome]}
                        </Badge>
                      </div>
                    )}
                    {isWin && trade.take_profit_outcome && (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Take Profit Outcome</p>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          {TAKE_PROFIT_OUTCOMES[trade.take_profit_outcome]}
                        </Badge>
                      </div>
                    )}
                  </>
                )}

                {/* Ratings */}
                {(trade.execution_rating || trade.plan_adherence_rating) && (
                  <div className="grid grid-cols-2 gap-4">
                    {trade.execution_rating && (
                      <div className="bg-slate-800/30 rounded-xl p-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Execution Rating</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "w-5 h-5",
                                star <= trade.execution_rating ? "fill-amber-400 text-amber-400" : "text-slate-600"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {trade.plan_adherence_rating && (
                      <div className="bg-slate-800/30 rounded-xl p-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Plan Adherence</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "w-5 h-5",
                                star <= trade.plan_adherence_rating ? "fill-emerald-400 text-emerald-400" : "text-slate-600"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Emotion */}
                {(trade.emotion || trade.emotion_other) && (
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Emotional State</p>
                    {trade.emotion && trade.emotion !== 'other' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{EMOTION_MAP[trade.emotion]?.emoji}</span>
                        <span className="text-white font-medium">{EMOTION_MAP[trade.emotion]?.label}</span>
                      </div>
                    ) : trade.emotion_other ? (
                      <span className="text-white">{trade.emotion_other}</span>
                    ) : null}
                  </div>
                )}

                {/* Behavioral Traits */}
                {(trade.positive_traits?.length > 0 || trade.negative_traits?.length > 0) && (
                  <div className="space-y-3">
                    {trade.positive_traits?.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Positive Traits</p>
                        <div className="flex flex-wrap gap-2">
                          {trade.positive_traits.map((trait, idx) => (
                            <Badge key={idx} className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                              {POSITIVE_TRAIT_LABELS[trait]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {trade.negative_traits?.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Negative Traits</p>
                        <div className="flex flex-wrap gap-2">
                          {trade.negative_traits.map((trait, idx) => (
                            <Badge key={idx} className="bg-red-500/20 text-red-300 border-red-500/30">
                              {NEGATIVE_TRAIT_LABELS[trait]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Trade Notes */}
                {trade.trade_notes && (
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Trade Notes</p>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{trade.trade_notes}</p>
                  </div>
                )}

                {/* Setup & Tags */}
                {(trade.setup_type || trade.tags?.length > 0 || trade.notes) && (
                  <div className="space-y-3">
                    {trade.setup_type && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-400">Setup:</span>
                        <span className="text-sm text-white">{trade.setup_type}</span>
                      </div>
                    )}
                    {trade.tags?.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-400">Tags:</span>
                        {trade.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-slate-800 text-slate-300 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {trade.notes && (
                      <div className="bg-slate-800/30 rounded-xl p-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Notes</p>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{trade.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Linked Journal Entries */}
                {journalEntries.length > 0 && (
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">
                      Linked Journal Entries ({journalEntries.length})
                    </p>
                    <div className="space-y-2">
                      {journalEntries.map((entry) => (
                        <div 
                          key={entry.id}
                          className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {entry.journal_type?.toLowerCase() || 'general'}
                              </Badge>
                              <p className="text-sm font-medium text-white truncate">
                                {entry.title || `${entry.journal_type} Journal`}
                              </p>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {format(new Date(entry.date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-800">
                  <Button
                    variant="outline"
                    onClick={() => onEdit(trade)}
                    className="flex-1 border-slate-600 text-slate-900 hover:bg-slate-800 hover:text-white"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Trade
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onDelete(trade)}
                    className="border-red-500/50 text-red-600 hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      {showImageLightbox && hasScreenshots && (
        <Dialog open={showImageLightbox} onOpenChange={setShowImageLightbox}>
          <DialogContent className="bg-slate-950 border-slate-800 max-w-6xl p-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowImageLightbox(false)}
                className="absolute top-2 right-2 z-10 bg-slate-900/80 hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </Button>
              <img 
                src={trade.screenshots[selectedImageIndex]?.url} 
                alt="Trade screenshot"
                className="w-full h-auto max-h-[85vh] object-contain"
              />
              {trade.screenshots.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                    disabled={selectedImageIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-900"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedImageIndex(Math.min(trade.screenshots.length - 1, selectedImageIndex + 1))}
                    disabled={selectedImageIndex === trade.screenshots.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-900"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 px-3 py-1 rounded-full">
                    <span className="text-sm text-white">
                      {selectedImageIndex + 1} / {trade.screenshots.length}
                    </span>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}