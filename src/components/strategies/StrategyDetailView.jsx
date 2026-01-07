import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Image as ImageIcon, TrendingUp, TrendingDown, Target, DollarSign, Calendar } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { enrichTradesWithPnL } from '@/components/common/tradeCalculations';
import { ScrollArea } from "@/components/ui/scroll-area";

export default function StrategyDetailView({ strategy, trades = [], open, onOpenChange, onEdit, onDelete }) {
  const [lightboxImage, setLightboxImage] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);

  const strategyTrades = useMemo(() => {
    if (!strategy) return [];
    return enrichTradesWithPnL(trades.filter(t => t.strategy_id === strategy.id));
  }, [strategy, trades]);

  const closedTrades = strategyTrades.filter(t => t.status === 'closed');
  const winningTrades = closedTrades.filter(t => t.profit_loss > 0);
  const losingTrades = closedTrades.filter(t => t.profit_loss < 0);
  
  const metrics = {
    totalTrades: closedTrades.length,
    winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length * 100) : 0,
    totalPnL: closedTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0),
    avgWin: winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.profit_loss, 0) / winningTrades.length : 0,
    avgLoss: losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + t.profit_loss, 0) / losingTrades.length : 0,
  };

  if (!strategy) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-slate-900 border-slate-800 p-0">
          <ScrollArea className="max-h-[90vh]">
            <div className="p-6">
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

              {/* Metrics Section */}
              {metrics.totalTrades > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pb-6 border-b border-slate-800">
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Trades</p>
                    <p className="text-2xl font-bold text-white">{metrics.totalTrades}</p>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Win Rate</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      metrics.winRate >= 50 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {metrics.winRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total P&L</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      metrics.totalPnL >= 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {metrics.totalPnL >= 0 ? '+' : ''}${metrics.totalPnL.toFixed(0)}
                    </p>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Avg Win/Loss</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-emerald-400">${Math.abs(metrics.avgWin).toFixed(0)}</span>
                      <span className="text-slate-600">/</span>
                      <span className="text-sm text-red-400">${Math.abs(metrics.avgLoss).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                {/* Strategy Details */}
                <div className="space-y-6">
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
                        Strategy Guide & Rules
                      </h3>
                      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {strategy.guidelines}
                        </p>
                      </div>
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

                {/* Associated Trades */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                    Associated Trades ({strategyTrades.length})
                  </h3>
                  {strategyTrades.length === 0 ? (
                    <div className="bg-slate-800/30 rounded-xl p-6 text-center border border-slate-700/50 border-dashed">
                      <Target className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">No trades using this strategy yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                      {strategyTrades.map((trade) => (
                        <button
                          key={trade.id}
                          onClick={() => setSelectedTrade(trade)}
                          className="w-full flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm",
                              trade.trade_type === 'long' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                            )}>
                              {trade.symbol.slice(0, 4)}
                            </div>
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{trade.symbol}</span>
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
                              <p className="text-xs text-slate-500">
                                {format(new Date(trade.entry_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          {trade.status === 'closed' && trade.profit_loss !== undefined && (
                            <span className={cn(
                              "font-bold text-lg",
                              trade.profit_loss >= 0 ? "text-emerald-400" : "text-red-400"
                            )}>
                              {trade.profit_loss >= 0 ? '+' : ''}${trade.profit_loss.toFixed(2)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
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