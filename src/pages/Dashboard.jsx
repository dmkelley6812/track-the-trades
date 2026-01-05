import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { 
  Plus, 
  Upload, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Activity,
  Loader2
} from 'lucide-react';
import { isAfter, isBefore } from 'date-fns';
import StatsCard from '@/components/dashboard/StatsCard';
import PnLChart from '@/components/dashboard/PnLChart';
import RecentTrades from '@/components/dashboard/RecentTrades';
import WinRateGauge from '@/components/dashboard/WinRateGauge';
import TradeForm from '@/components/trades/TradeForm';
import CSVImporter from '@/components/trades/CSVImporter';
import TradeDetailModal from '@/components/common/TradeDetailModal';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import DateFilter, { getDateRange } from '@/components/dashboard/DateFilter';

export default function Dashboard() {
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
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

  const { data: trades = [], isLoading: tradesLoading } = useQuery({
    queryKey: ['trades'],
    queryFn: () => base44.entities.Trade.filter({ created_by: user?.email }, '-entry_date'),
    enabled: !!user
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

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });

  // Filter trades by date range
  const dateRange = getDateRange(dateFilter, customStartDate, customEndDate);
  const filteredTrades = trades.filter(trade => {
    if (trade.status !== 'closed' || !trade.exit_date) return true; // Include open trades
    if (!dateRange) return true;
    
    const tradeDate = new Date(trade.exit_date);
    return !isBefore(tradeDate, dateRange.start) && !isAfter(tradeDate, dateRange.end);
  });

  // Calculate stats from filtered trades
  const closedTrades = filteredTrades.filter(t => t.status === 'closed');
  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
  const wins = closedTrades.filter(t => t.profit_loss > 0).length;
  const losses = closedTrades.filter(t => t.profit_loss < 0).length;
  const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;
  const avgWin = wins > 0 
    ? closedTrades.filter(t => t.profit_loss > 0).reduce((sum, t) => sum + t.profit_loss, 0) / wins 
    : 0;
  const avgLoss = losses > 0 
    ? Math.abs(closedTrades.filter(t => t.profit_loss < 0).reduce((sum, t) => sum + t.profit_loss, 0)) / losses 
    : 0;
  const profitFactor = avgLoss > 0 ? (avgWin * wins) / (avgLoss * losses) : 0;

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
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Show onboarding for new users
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
              onClick={() => setShowImporter(true)}
              className="border-slate-700 text-slate-900 hover:bg-slate-800 hover:text-white bg-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
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
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total P&L"
            value={`${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`}
            icon={DollarSign}
            className={totalPnL >= 0 ? "border-emerald-500/20" : "border-red-500/20"}
          />
          <StatsCard
            title="Win Rate"
            value={`${winRate.toFixed(1)}%`}
            subtitle={`${wins}W / ${losses}L`}
            icon={Target}
          />
          <StatsCard
            title="Profit Factor"
            value={profitFactor.toFixed(2)}
            icon={TrendingUp}
          />
          <StatsCard
            title="Total Trades"
            value={filteredTrades.length}
            subtitle={`${filteredTrades.filter(t => t.status === 'open').length} open`}
            icon={Activity}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart & Win Rate */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Cumulative P&L</h2>
              <PnLChart trades={filteredTrades} />
            </div>
          </div>

          {/* Win Rate Gauge */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 flex items-center justify-center">
            <WinRateGauge winRate={winRate} wins={wins} losses={losses} />
          </div>
        </div>

        {/* Recent Trades */}
        <div className="mt-6 bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Trades</h2>
          {tradesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          ) : (
            <RecentTrades trades={filteredTrades} onTradeClick={setSelectedTrade} />
          )}
        </div>
      </div>

      {/* Trade Form Sheet */}
      <Sheet open={showTradeForm} onOpenChange={setShowTradeForm}>
        <SheetContent className="bg-slate-900 border-slate-800 w-full sm:max-w-lg overflow-y-auto">
          <TradeForm
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