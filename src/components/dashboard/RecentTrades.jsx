import { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function RecentTrades({ trades, onTradeClick }) {
  const [page, setPage] = useState(0);
  const tradesPerPage = 8;
  
  const sortedTrades = [...trades].sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
  const totalPages = Math.ceil(sortedTrades.length / tradesPerPage);
  const recentTrades = sortedTrades.slice(page * tradesPerPage, (page + 1) * tradesPerPage);

  if (sortedTrades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <p>No trades yet</p>
        <p className="text-sm mt-1">Add your first trade to get started</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-2 overflow-auto">
      {recentTrades.map((trade) => {
        const isWin = trade.profit_loss > 0;
        const isLoss = trade.profit_loss < 0;
        
        return (
          <div
            key={trade.id}
            onClick={() => onTradeClick?.(trade)}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl",
              "bg-slate-800/30 hover:bg-slate-800/50 border border-slate-800/50",
              "cursor-pointer transition-all duration-200",
              "group"
            )}
          >
            <div className="flex items-center gap-4">
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
                <p className="text-sm text-slate-500 mt-0.5">
                  {format(new Date(trade.entry_date), 'MMM d, yyyy • h:mm a')}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              {trade.status === 'closed' && trade.profit_loss !== undefined ? (
                <>
                  <p className={cn(
                    "font-bold text-lg",
                    isWin ? "text-emerald-400" : isLoss ? "text-red-400" : "text-slate-400"
                  )}>
                    {isWin ? '+' : ''}{trade.profit_loss?.toFixed(2) || '0.00'}
                  </p>
                  {trade.profit_loss_percent !== undefined && (
                    <p className={cn(
                      "text-sm",
                      isWin ? "text-emerald-400/70" : isLoss ? "text-red-400/70" : "text-slate-500"
                    )}>
                      {isWin ? '+' : ''}{trade.profit_loss_percent?.toFixed(2)}%
                    </p>
                  )}
                </>
              ) : (
                <p className="text-slate-500 text-sm">
                  {trade.quantity} @ ${trade.entry_price}
                </p>
              )}
            </div>
          </div>
        );
      })}
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-slate-400 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="text-slate-400 hover:text-white disabled:opacity-30"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}