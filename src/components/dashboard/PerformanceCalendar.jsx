import { useMemo } from 'react';
import { format, eachDayOfInterval, isSameDay } from 'date-fns';
import { cn } from "@/lib/utils";

export default function PerformanceCalendar({ trades, dateRange, onDayClick }) {
  // Aggregate daily stats
  const dailyStats = useMemo(() => {
    if (!dateRange) return {};
    
    const closedTrades = trades.filter(t => t.status === 'closed' && t.exit_date);
    const stats = {};
    
    closedTrades.forEach(trade => {
      const tradeDate = format(new Date(trade.exit_date), 'yyyy-MM-dd');
      
      if (!stats[tradeDate]) {
        stats[tradeDate] = {
          trades: [],
          totalPnL: 0,
          wins: 0,
          losses: 0
        };
      }
      
      stats[tradeDate].trades.push(trade);
      stats[tradeDate].totalPnL += trade.profit_loss || 0;
      
      if (trade.profit_loss > 0) {
        stats[tradeDate].wins++;
      } else if (trade.profit_loss < 0) {
        stats[tradeDate].losses++;
      }
    });
    
    // Calculate win rate for each day
    Object.keys(stats).forEach(date => {
      const dayStats = stats[date];
      const totalTrades = dayStats.trades.length;
      dayStats.winRate = totalTrades > 0 ? (dayStats.wins / totalTrades) * 100 : 0;
    });
    
    return stats;
  }, [trades, dateRange]);

  // Get days in the filtered range
  const daysInRange = useMemo(() => {
    if (!dateRange) return [];
    return eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  }, [dateRange]);

  if (!dateRange || daysInRange.length === 0) {
    return null;
  }

  const handleDayClick = (date, stats) => {
    if (onDayClick && stats?.trades?.length > 0) {
      onDayClick(date, stats);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">Daily Performance</h2>
      
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-slate-500 pb-2">
            {day}
          </div>
        ))}
        
        {/* Fill empty slots for first week */}
        {Array.from({ length: daysInRange[0]?.getDay() || 0 }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        
        {/* Day blocks */}
        {daysInRange.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const stats = dailyStats[dateStr];
          const hasTrades = stats?.trades?.length > 0;
          const isProfit = hasTrades && stats.totalPnL > 0;
          const isLoss = hasTrades && stats.totalPnL < 0;
          const isFlat = hasTrades && stats.totalPnL === 0;
          
          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(date, stats)}
              disabled={!hasTrades}
              className={cn(
                "aspect-square rounded-lg p-2 transition-all border text-left relative",
                "flex flex-col justify-between min-h-[80px]",
                hasTrades && "cursor-pointer hover:scale-105",
                !hasTrades && "cursor-default",
                isProfit && "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20",
                isLoss && "bg-red-500/10 border-red-500/30 hover:bg-red-500/20",
                isFlat && "bg-slate-800/30 border-slate-700",
                !hasTrades && "bg-slate-900/30 border-slate-800/30"
              )}
            >
              <div className="text-xs font-medium text-slate-400">
                {format(date, 'd')}
              </div>
              
              {hasTrades && (
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <span>{stats.trades.length}</span>
                    <span className="text-[10px]">trade{stats.trades.length !== 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className={cn(
                    "text-sm font-bold",
                    isProfit && "text-emerald-400",
                    isLoss && "text-red-400",
                    isFlat && "text-slate-400"
                  )}>
                    {isProfit && '+'}${Math.abs(stats.totalPnL).toFixed(0)}
                  </div>
                  
                  <div className="text-[10px] text-slate-500">
                    {stats.winRate.toFixed(0)}% WR
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
          <span className="text-xs text-slate-400">Profit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
          <span className="text-xs text-slate-400">Loss</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-800/30 border border-slate-700" />
          <span className="text-xs text-slate-400">Flat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-900/30 border border-slate-800/30" />
          <span className="text-xs text-slate-400">No trades</span>
        </div>
      </div>
    </div>
  );
}