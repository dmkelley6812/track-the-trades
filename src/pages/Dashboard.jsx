import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { 
  Plus, 
  Upload, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Activity,
  Loader2,
  Calculator,
  Settings
} from 'lucide-react';
import { isAfter, isBefore, format as formatDate } from 'date-fns';
import { toast } from 'sonner';

import StatsCard from '@/components/dashboard/StatsCard';
import PnLChart from '@/components/dashboard/PnLChart';
import RecentTrades from '@/components/dashboard/RecentTrades';
import WinRateGauge from '@/components/dashboard/WinRateGauge';
import PerformanceCalendar from '@/components/dashboard/PerformanceCalendar';
import TradeFormEnhanced from '@/components/trades/TradeFormEnhanced';
import CSVImporter from '@/components/trades/CSVImporter';
import TradeDetailModal from '@/components/common/TradeDetailModal';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import DateFilter, { getDateRange } from '@/components/dashboard/DateFilter';
import DashboardCustomizer from '@/components/dashboard/DashboardCustomizer';
import DashboardWidget from '@/components/dashboard/DashboardWidget';
import { enrichTradesWithPnL } from '@/components/common/tradeCalculations';
import { WIDGET_TYPES, DEFAULT_LAYOUT, WIDGET_CONFIG, generateGridLayout, validateWidgetDimensions } from '@/components/dashboard/widgetConfig';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget Grid Component with dynamic sizing
function WidgetGrid({ visibleWidgets, onLayoutChange, onRemove, onResize, renderWidget }) {
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Memoize grid layout to prevent regeneration
  const gridLayout = useMemo(() => {
    return generateGridLayout(visibleWidgets);
  }, [visibleWidgets]);

  // Calculate dynamic rowHeight to make squares actually square
  const rowHeight = useMemo(() => {
    if (containerWidth === 0) return 150;
    // 4 columns with 16px margin between = 3 gaps = 48px total margin
    const availableWidth = containerWidth - 48;
    const columnWidth = availableWidth / 4;
    return Math.floor(columnWidth);
  }, [containerWidth]);

  return (
    <div ref={(el) => {
      if (el && containerWidth === 0) {
        setContainerWidth(el.offsetWidth);
      }
    }}>
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: gridLayout }}
        breakpoints={{ lg: 0 }}
        cols={{ lg: 4 }}
        rowHeight={rowHeight}
        width={containerWidth || 1200}
        onLayoutChange={(newLayout) => onLayoutChange(newLayout)}
        isDraggable={true}
        isResizable={false}
        compactType="vertical"
        preventCollision={true}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        draggableHandle=".widget-drag-handle"
        droppingItem={{ i: '__dropping-elem__', w: 1, h: 1 }}
        onDrop={(layout, item, e) => {
          // Handle drop for stacking
          const draggedWidget = visibleWidgets.find(w => w.id === item.i);
          if (!draggedWidget) return;

          // Find if dropped on another widget
          const targetWidget = visibleWidgets.find(w => {
            if (w.id === item.i) return false;
            const overlap = (
              item.x < w.x + w.w &&
              item.x + item.w > w.x &&
              item.y < w.y + w.h &&
              item.y + item.h > w.y
            );
            return overlap;
          });

          if (targetWidget) {
            const draggedConfig = WIDGET_CONFIG[draggedWidget.type];
            const targetConfig = WIDGET_CONFIG[targetWidget.type];

            // Check if both are stackable
            if (draggedConfig?.constraints?.stackable && targetConfig?.constraints?.stackable) {
              // Stack them
              onLayoutChange(layout);
            }
          }
        }}
      >
        {visibleWidgets.map((widget) => (
          <div key={widget.id} className="h-full">
            <DashboardWidget
              widget={widget}
              onRemove={onRemove}
              onResize={onResize}
            >
              {renderWidget(widget)}
            </DashboardWidget>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}

// Import new widget components
import AvgWinWidget from '@/components/dashboard/widgets/AvgWinWidget';
import AvgLossWidget from '@/components/dashboard/widgets/AvgLossWidget';
import BestDayWidget from '@/components/dashboard/widgets/BestDayWidget';
import WorstDayWidget from '@/components/dashboard/widgets/WorstDayWidget';
import LargestDrawdownWidget from '@/components/dashboard/widgets/LargestDrawdownWidget';
import PnLByDayOfWeekWidget from '@/components/dashboard/widgets/PnLByDayOfWeekWidget';
import TradeCountByDayWidget from '@/components/dashboard/widgets/TradeCountByDayWidget';
import PnLByStrategyWidget from '@/components/dashboard/widgets/PnLByStrategyWidget';

export default function Dashboard() {
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [dateFilter, setDateFilter] = useState(() => {
    return localStorage.getItem('dashboard_date_filter') || 'current_week';
  });
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: rawTrades = [], isLoading: tradesLoading } = useQuery({
    queryKey: ['trades'],
    queryFn: () => base44.entities.Trade.filter({ created_by: user?.email }, '-entry_date'),
    enabled: !!user
  });

  const trades = enrichTradesWithPnL(rawTrades);

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Dashboard layout saved');
    },
    onError: () => {
      toast.error('Failed to save layout');
    }
  });

  const createTradeMutation = useMutation({
    mutationFn: (data) => base44.entities.Trade.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      setShowTradeForm(false);
      setEditingTrade(null);
    }
  });

  const updateTradeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Trade.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      setShowTradeForm(false);
      setEditingTrade(null);
      setSelectedTrade(null);
    }
  });

  const deleteTradeMutation = useMutation({
    mutationFn: (id) => base44.entities.Trade.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      setSelectedTrade(null);
    }
  });

  // Validate and repair layout on load
  const validatedLayout = useMemo(() => {
    const userLayout = user?.dashboard_layout || DEFAULT_LAYOUT;
    
    return userLayout.map(widget => {
      const config = WIDGET_CONFIG[widget.type];
      const defaultSize = config?.defaultSize || { w: 1, h: 1 };
      
      return {
        ...widget,
        w: widget.w ?? defaultSize.w,
        h: widget.h ?? defaultSize.h,
        x: widget.x ?? 0,
        y: widget.y ?? 0,
      };
    });
  }, [user?.dashboard_layout]);

  const layout = validatedLayout;
  const visibleWidgets = layout.filter(w => w.visible);

  // Filter trades by date range
  const dateRange = getDateRange(dateFilter, customStartDate, customEndDate);
  const filteredTrades = trades.filter(trade => {
    if (trade.status !== 'closed' || !trade.exit_date) return true;
    if (!dateRange) return true;
    
    const tradeDate = new Date(trade.exit_date);
    return !isBefore(tradeDate, dateRange.start) && !isAfter(tradeDate, dateRange.end);
  });

  // Calculate comprehensive stats
  const closedTrades = filteredTrades.filter(t => t.status === 'closed');
  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
  const wins = closedTrades.filter(t => t.profit_loss > 0).length;
  const losses = closedTrades.filter(t => t.profit_loss < 0).length;
  const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;
  const totalWins = closedTrades.filter(t => t.profit_loss > 0).reduce((sum, t) => sum + t.profit_loss, 0);
  const totalLosses = Math.abs(closedTrades.filter(t => t.profit_loss < 0).reduce((sum, t) => sum + t.profit_loss, 0));
  const avgWin = wins > 0 ? totalWins / wins : 0;
  const avgLoss = losses > 0 ? totalLosses / losses : 0;
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : (totalWins > 0 ? totalWins : 0);
  const expectancy = closedTrades.length > 0 
    ? (winRate / 100 * avgWin) - ((100 - winRate) / 100 * avgLoss)
    : 0;

  // Calculate best/worst day and drawdown
  const dailyPnL = {};
  closedTrades.forEach(trade => {
    const date = formatDate(new Date(trade.exit_date), 'yyyy-MM-dd');
    dailyPnL[date] = (dailyPnL[date] || 0) + trade.profit_loss;
  });

  const dailyPnLArray = Object.entries(dailyPnL).map(([date, pnl]) => ({ date, pnl }));
  const bestDay = dailyPnLArray.length > 0 
    ? dailyPnLArray.reduce((best, day) => day.pnl > best.pnl ? day : best, dailyPnLArray[0])
    : null;
  const worstDay = dailyPnLArray.length > 0
    ? dailyPnLArray.reduce((worst, day) => day.pnl < worst.pnl ? day : worst, dailyPnLArray[0])
    : null;

  // Calculate largest drawdown
  let peak = 0;
  let largestDrawdown = 0;
  let cumulativePnL = 0;
  closedTrades.forEach(trade => {
    cumulativePnL += trade.profit_loss;
    if (cumulativePnL > peak) peak = cumulativePnL;
    const drawdown = peak - cumulativePnL;
    if (drawdown > largestDrawdown) largestDrawdown = drawdown;
  });

  const stats = {
    totalPnL,
    winRate,
    wins,
    losses,
    profitFactor,
    expectancy,
    totalTrades: filteredTrades.length,
    openTrades: filteredTrades.filter(t => t.status === 'open').length,
    avgWin,
    avgLoss,
    bestDay,
    worstDay,
    largestDrawdown,
  };

  const handleCustomizerLayoutChange = (newLayout) => {
    updateUserMutation.mutate({ dashboard_layout: newLayout });
  };

  const handleResetLayout = () => {
    updateUserMutation.mutate({ dashboard_layout: DEFAULT_LAYOUT });
  };

  const handleRemoveWidget = (widgetId) => {
    const newLayout = layout.map(w => w.id === widgetId ? { ...w, visible: false } : w);
    updateUserMutation.mutate({ dashboard_layout: newLayout });
  };

  const handleResizeWidget = (widgetId, newSize) => {
    const widget = layout.find(w => w.id === widgetId);
    if (!widget) return;

    const validatedSize = validateWidgetDimensions(widget.type, newSize);
    const newLayout = layout.map(w => 
      w.id === widgetId ? { ...w, w: validatedSize.w, h: validatedSize.h } : w
    );
    updateUserMutation.mutate({ dashboard_layout: newLayout });
  };

  const handleGridLayoutChange = (newGridLayout) => {
    // Update positions AND dimensions in our layout based on grid changes
    const updatedLayout = layout.map(widget => {
      const gridItem = newGridLayout.find(g => g.i === widget.id);
      if (gridItem) {
        return {
          ...widget,
          x: gridItem.x,
          y: gridItem.y,
          w: gridItem.w,
          h: gridItem.h,
        };
      }
      return widget;
    });

    updateUserMutation.mutate({ dashboard_layout: updatedLayout });
  };

  const renderWidget = (widget) => {
    switch (widget.type) {
      case WIDGET_TYPES.TOTAL_PNL:
        return (
          <StatsCard
            title="Total P&L"
            value={
              <span className={stats.totalPnL >= 0 ? "text-emerald-400" : "text-red-400"}>
                ${stats.totalPnL.toFixed(2)}
              </span>
            }
            icon={DollarSign}
            info="Total Profit & Loss across all closed trades in the selected time period"
          />
        );
      case WIDGET_TYPES.WIN_RATE:
        const isCompact = widget.w === 1 && widget.h === 1;
        return (
          <StatsCard
            title="Win Rate"
            value={`${stats.winRate.toFixed(1)}%`}
            subtitle={isCompact ? undefined : `${stats.wins}W / ${stats.losses}L`}
            icon={Target}
            info="Percentage of winning trades out of total trades"
          />
        );
      case WIDGET_TYPES.PROFIT_FACTOR:
        return (
          <StatsCard
            title="Profit Factor"
            value={
              <span className={stats.profitFactor >= 1.5 ? "text-emerald-400" : stats.profitFactor >= 1 ? "text-white" : "text-red-400"}>
                {stats.profitFactor.toFixed(2)}
              </span>
            }
            icon={TrendingUp}
            info="Ratio of gross profit to gross loss"
          />
        );
      case WIDGET_TYPES.EXPECTANCY:
        return (
          <StatsCard
            title="Expectancy"
            value={
              <span className={stats.expectancy >= 0 ? "text-emerald-400" : "text-red-400"}>
                ${stats.expectancy.toFixed(2)}
              </span>
            }
            subtitle="Per trade"
            icon={Calculator}
            info="Average amount you can expect to win or lose per trade"
          />
        );
      case WIDGET_TYPES.TOTAL_TRADES:
        return (
          <StatsCard
            title="Total Trades"
            value={stats.totalTrades}
            subtitle={`${stats.openTrades} open`}
            icon={Activity}
            info="Total number of trades in the selected time period"
          />
        );
      case WIDGET_TYPES.AVG_WIN:
        return <AvgWinWidget stats={stats} />;
      case WIDGET_TYPES.AVG_LOSS:
        return <AvgLossWidget stats={stats} />;
      case WIDGET_TYPES.BEST_DAY:
        return <BestDayWidget stats={stats} />;
      case WIDGET_TYPES.WORST_DAY:
        return <WorstDayWidget stats={stats} />;
      case WIDGET_TYPES.LARGEST_DRAWDOWN:
        return <LargestDrawdownWidget stats={stats} />;
      case WIDGET_TYPES.PNL_CHART:
        return (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Cumulative P&L</h2>
            <div className="flex-1 min-h-0">
              <PnLChart trades={filteredTrades} />
            </div>
          </div>
        );
      case WIDGET_TYPES.WIN_RATE_GAUGE:
        const gaugeSize = widget.w === 1 ? 'small' : 'normal';
        return (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-3 h-full flex items-center justify-center">
            <WinRateGauge 
              winRate={stats.winRate} 
              wins={stats.wins} 
              losses={stats.losses}
              size={gaugeSize}
            />
          </div>
        );
      case WIDGET_TYPES.RECENT_TRADES:
        const tradesCompact = widget.w < 2 || widget.h < 2;
        return (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-3 h-full flex flex-col">
            {!tradesCompact && <h2 className="text-lg font-semibold mb-4">All Trades</h2>}
            {tradesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
              </div>
            ) : (
              <div className="flex-1 min-h-0">
                <RecentTrades 
                  trades={filteredTrades} 
                  onTradeClick={setSelectedTrade}
                  compact={tradesCompact}
                />
              </div>
            )}
          </div>
        );
      case WIDGET_TYPES.TRADE_CALENDAR:
        return <PerformanceCalendar trades={filteredTrades} dateRange={dateRange} />;
      case WIDGET_TYPES.PNL_BY_DAY_OF_WEEK:
        return <PnLByDayOfWeekWidget trades={filteredTrades} />;
      case WIDGET_TYPES.TRADE_COUNT_BY_DAY:
        return <TradeCountByDayWidget trades={filteredTrades} />;
      case WIDGET_TYPES.PNL_BY_STRATEGY:
        return <PnLByStrategyWidget trades={filteredTrades} />;
      default:
        return <div className="bg-slate-800/50 p-4 rounded-lg">Unknown widget</div>;
    }
  };

  const handleTradeSubmit = (data) => {
    if (editingTrade) {
      updateTradeMutation.mutate({ id: editingTrade.id, data });
    } else {
      createTradeMutation.mutate(data);
    }
  };

  const handleEditTrade = (trade) => {
    setEditingTrade(trade);
    setSelectedTrade(null);
    setShowTradeForm(true);
  };

  const handleDeleteTrade = (trade) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      deleteTradeMutation.mutate(trade.id);
    }
  };

  const handleOnboardingComplete = (userData) => {
    updateUserMutation.mutate(userData);
  };

  const handleDateFilterChange = (filterType, customStart, customEnd) => {
    setDateFilter(filterType);
    setCustomStartDate(customStart);
    setCustomEndDate(customEnd);
    localStorage.setItem('dashboard_date_filter', filterType);
    if (filterType === 'custom' && customStart && customEnd) {
      localStorage.setItem('dashboard_custom_start', customStart.toISOString());
      localStorage.setItem('dashboard_custom_end', customEnd.toISOString());
    }
  };

  const handleCustomDatesChange = (start, end) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
    if (start && end) {
      localStorage.setItem('dashboard_custom_start', start.toISOString());
      localStorage.setItem('dashboard_custom_end', end.toISOString());
    }
  };

  useEffect(() => {
    const savedStart = localStorage.getItem('dashboard_custom_start');
    const savedEnd = localStorage.getItem('dashboard_custom_end');
    if (savedStart && savedEnd) {
      setCustomStartDate(new Date(savedStart));
      setCustomEndDate(new Date(savedEnd));
    }
  }, []);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (user && !user.onboarding_completed) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} user={user} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-slate-400 mt-1">Track your trading performance</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCustomizer(true)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Settings className="w-4 h-4 mr-2" />
              Customize
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowImporter(true)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button
              onClick={() => {
                setEditingTrade(null);
                setShowTradeForm(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Trade
            </Button>
          </div>
        </div>

        {/* Date Filter */}
        <div className="mb-6">
          <DateFilter 
            value={dateFilter} 
            onChange={handleDateFilterChange}
            customStart={customStartDate}
            customEnd={customEndDate}
            onCustomDatesChange={handleCustomDatesChange}
          />
        </div>

        {/* Widgets Grid with Drag & Drop */}
        <WidgetGrid
          visibleWidgets={visibleWidgets}
          onLayoutChange={handleGridLayoutChange}
          onRemove={handleRemoveWidget}
          onResize={handleResizeWidget}
          renderWidget={renderWidget}
        />
      </div>

      {/* Dashboard Customizer */}
      <DashboardCustomizer
        open={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        layout={layout}
        onLayoutChange={handleCustomizerLayoutChange}
        onReset={handleResetLayout}
      />

      {/* Trade Form Sheet */}
      <Sheet open={showTradeForm} onOpenChange={setShowTradeForm}>
        <SheetContent className="bg-slate-900 border-slate-800 w-full sm:max-w-4xl overflow-y-auto">
          <TradeFormEnhanced
            trade={editingTrade}
            onSubmit={handleTradeSubmit}
            onCancel={() => {
              setShowTradeForm(false);
              setEditingTrade(null);
            }}
            isLoading={createTradeMutation.isPending || updateTradeMutation.isPending}
          />
        </SheetContent>
      </Sheet>

      {/* CSV Importer Sheet */}
      <Sheet open={showImporter} onOpenChange={setShowImporter}>
        <SheetContent className="bg-slate-900 border-slate-800 w-full sm:max-w-lg overflow-y-auto">
          <CSVImporter
            onImportComplete={() => {
              setShowImporter(false);
              queryClient.invalidateQueries({ queryKey: ['trades'] });
            }}
            onCancel={() => setShowImporter(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Trade Detail Modal */}
      <TradeDetailModal
        trade={selectedTrade}
        open={!!selectedTrade}
        onClose={() => setSelectedTrade(null)}
        onEdit={handleEditTrade}
        onDelete={handleDeleteTrade}
      />
    </div>
  );
}