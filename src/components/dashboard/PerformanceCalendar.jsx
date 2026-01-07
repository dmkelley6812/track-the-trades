import { useMemo, useState, useEffect } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth, isAfter, isBefore, isWithinInterval, min, max } from 'date-fns';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PerformanceCalendar({ trades, dateRange, onDayClick }) {
  const navigate = useNavigate();
  // Initialize displayed month to the most recent month in filter range
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    if (!dateRange) return new Date();
    const endDate = dateRange.end;
    const today = new Date();
    return isAfter(endDate, today) ? today : endDate;
  });

  // Update displayed month when date range changes
  useEffect(() => {
    if (!dateRange) return;
    const endDate = dateRange.end;
    const today = new Date();
    setDisplayedMonth(isAfter(endDate, today) ? today : endDate);
  }, [dateRange]);

  // Aggregate daily stats (for entire filter range)
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

  // Get days in the currently displayed month (calendar view)
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(displayedMonth);
    const monthEnd = endOfMonth(displayedMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [displayedMonth]);

  // Check if prev/next month navigation is valid
  const canGoPrev = useMemo(() => {
    if (!dateRange) return false;
    const prevMonth = subMonths(displayedMonth, 1);
    const prevMonthEnd = endOfMonth(prevMonth);
    return !isBefore(prevMonthEnd, dateRange.start);
  }, [displayedMonth, dateRange]);

  const canGoNext = useMemo(() => {
    if (!dateRange) return false;
    const nextMonth = addMonths(displayedMonth, 1);
    const nextMonthStart = startOfMonth(nextMonth);
    const today = new Date();
    return !isAfter(nextMonthStart, min([dateRange.end, today]));
  }, [displayedMonth, dateRange]);

  if (!dateRange) {
    return null;
  }

  const handleDayClick = (date, stats) => {
    if (onDayClick) {
      onDayClick(date, stats);
    } else if (stats?.trades?.length > 0) {
      // Default behavior: navigate to Trades page filtered to this date
      const dateStr = format(date, 'yyyy-MM-dd');
      navigate(`${createPageUrl('Trades')}?start=${dateStr}&end=${dateStr}`);
    }
  };

  const isDateInRange = (date) => {
    return isWithinInterval(date, { start: dateRange.start, end: dateRange.end });
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 h-full flex flex-col overflow-hidden">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h2 className="text-base font-semibold">Daily Performance</h2>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-medium">
            {format(displayedMonth, 'MMM yyyy')}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDisplayedMonth(subMonths(displayedMonth, 1))}
              disabled={!canGoPrev}
              className="h-6 w-6 text-slate-400 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDisplayedMonth(addMonths(displayedMonth, 1))}
              disabled={!canGoNext}
              className="h-6 w-6 text-slate-400 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col overflow-auto">
        <div className="grid grid-cols-7 gap-1 auto-rows-fr">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[10px] font-medium text-slate-500 pb-1">
              {day}
            </div>
          ))}
          
          {/* Day blocks */}
          {monthDays.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const stats = dailyStats[dateStr];
            const inCurrentMonth = isSameMonth(date, displayedMonth);
            const inFilterRange = isDateInRange(date);
            const isClickable = inCurrentMonth && inFilterRange;
            const hasTrades = stats?.trades?.length > 0;
            const isProfit = hasTrades && stats.totalPnL > 0;
            const isLoss = hasTrades && stats.totalPnL < 0;
            const isFlat = hasTrades && stats.totalPnL === 0;
            
            return (
              <button
                key={dateStr}
                onClick={() => isClickable && handleDayClick(date, stats)}
                disabled={!isClickable || !hasTrades}
                className={cn(
                  "aspect-square rounded-md p-1 transition-all border text-left relative",
                  "flex flex-col justify-between",
                  !inCurrentMonth && "opacity-30",
                  !inFilterRange && "opacity-20 cursor-not-allowed",
                  isClickable && hasTrades && "cursor-pointer hover:scale-105",
                  (!isClickable || !hasTrades) && "cursor-default",
                  isClickable && isProfit && "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20",
                  isClickable && isLoss && "bg-red-500/10 border-red-500/30 hover:bg-red-500/20",
                  isClickable && isFlat && "bg-slate-800/30 border-slate-700",
                  isClickable && !hasTrades && "bg-slate-900/30 border-slate-800/30",
                  !isClickable && "bg-slate-900/10 border-slate-800/20"
                )}
              >
                <div className={cn(
                  "text-[10px] font-medium",
                  inCurrentMonth && inFilterRange ? "text-slate-400" : "text-slate-600"
                )}>
                  {format(date, 'd')}
                </div>
                
                {isClickable && hasTrades && (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-0.5 text-[9px] text-slate-400">
                      <span>{stats.trades.length}</span>
                      <span className="text-[8px]">T</span>
                    </div>
                    
                    <div className={cn(
                      "text-[10px] font-bold",
                      isProfit && "text-emerald-400",
                      isLoss && "text-red-400",
                      isFlat && "text-slate-400"
                    )}>
                      {isProfit && '+'}${Math.abs(stats.totalPnL).toFixed(0)}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-2 pt-2 border-t border-slate-800/50 flex-shrink-0">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded bg-emerald-500/20 border border-emerald-500/30" />
          <span className="text-[10px] text-slate-400">Profit</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded bg-red-500/20 border border-red-500/30" />
          <span className="text-[10px] text-slate-400">Loss</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded bg-slate-800/30 border border-slate-700" />
          <span className="text-[10px] text-slate-400">Flat</span>
        </div>
      </div>
    </div>
  );
}