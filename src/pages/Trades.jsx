import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  Loader2,
  Calendar,
  Trash2,
  DollarSign,
  Target
} from 'lucide-react';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { cn } from "@/lib/utils";
import TradeForm from '@/components/trades/TradeForm';
import TradeDetailModal from '@/components/common/TradeDetailModal';
import { Checkbox } from "@/components/ui/checkbox";
import DateFilter, { getDateRange } from '@/components/dashboard/DateFilter';
import StatsCard from '@/components/dashboard/StatsCard';
import ColumnCustomizer from '@/components/trades/ColumnCustomizer';
import { enrichTradesWithPnL } from '@/components/common/tradeCalculations';
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

const DEFAULT_COLUMNS = [
  { id: 'symbol', label: 'Symbol', visible: true },
  { id: 'type', label: 'Type', visible: true },
  { id: 'entry', label: 'Entry', visible: true },
  { id: 'exit', label: 'Exit', visible: true },
  { id: 'qty', label: 'Qty', visible: true },
  { id: 'pnl', label: 'P&L', visible: true },
  { id: 'date', label: 'Date', visible: true },
  { id: 'status', label: 'Status', visible: true },
];

export default function Trades() {
  const queryClient = useQueryClient();
  
  // Initialize date filter from URL params FIRST, then default to current_week
  const initializeDateFilter = () => {
    const params = new URLSearchParams(window.location.search);
    const startParam = params.get('start');
    const endParam = params.get('end');
    
    if (startParam && endParam) {
      // Parse dates and ensure they're set to start/end of day
      const start = startOfDay(new Date(startParam + 'T00:00:00'));
      const end = endOfDay(new Date(endParam + 'T23:59:59'));
      
      return {
        filter: 'custom',
        start: start,
        end: end
      };
    }
    
    return {
      filter: 'current_week',
      start: null,
      end: null
    };
  };

  const initialFilter = initializeDateFilter();
  
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTradeIds, setSelectedTradeIds] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dateFilter, setDateFilter] = useState(initialFilter.filter);
  const [customStartDate, setCustomStartDate] = useState(initialFilter.start);
  const [customEndDate, setCustomEndDate] = useState(initialFilter.end);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const [columns, setColumns] = useState(() => {
    return user?.trades_table_columns || DEFAULT_COLUMNS;
  });

  useEffect(() => {
    if (user?.trades_table_columns) {
      setColumns(user.trades_table_columns);
    }
  }, [user]);

  const updateColumnsMutation = useMutation({
    mutationFn: (columns) => base44.auth.updateMe({ trades_table_columns: columns }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });

  const handleColumnsChange = (newColumns) => {
    setColumns(newColumns);
    updateColumnsMutation.mutate(newColumns);
  };

  const { data: rawTrades = [], isLoading } = useQuery({
    queryKey: ['trades'],
    queryFn: () => base44.entities.Trade.filter({ created_by: user?.email }, '-entry_date'),
    enabled: !!user
  });

  // Enrich trades with calculated P&L
  const trades = enrichTradesWithPnL(rawTrades);

  const createTradeMutation = useMutation({
    mutationFn: (data) => base44.entities.Trade.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      setShowTradeForm(false);
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

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map(id => base44.entities.Trade.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      setSelectedTradeIds([]);
      setShowDeleteDialog(false);
    }
  });

  // Filter trades by date range
  const dateRange = getDateRange(dateFilter, customStartDate, customEndDate);
  
  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.setup_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trade.status === statusFilter;
    const matchesType = typeFilter === 'all' || trade.trade_type === typeFilter;
    
    // Date filtering (only for closed trades with exit_date)
    let matchesDate = true;
    if (dateRange && trade.status === 'closed' && trade.exit_date) {
      const tradeDate = new Date(trade.exit_date);
      matchesDate = !isBefore(tradeDate, dateRange.start) && !isAfter(tradeDate, dateRange.end);
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  // Calculate stats from filtered closed trades
  const closedTrades = filteredTrades.filter(t => t.status === 'closed');
  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
  const wins = closedTrades.filter(t => t.profit_loss > 0).length;
  const losses = closedTrades.filter(t => t.profit_loss < 0).length;
  const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;

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

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedTradeIds(filteredTrades.map(t => t.id));
    } else {
      setSelectedTradeIds([]);
    }
  };

  const handleSelectTrade = (tradeId, checked) => {
    if (checked) {
      setSelectedTradeIds(prev => [...prev, tradeId]);
    } else {
      setSelectedTradeIds(prev => prev.filter(id => id !== tradeId));
    }
  };

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedTradeIds);
  };

  const handleDateFilterChange = (filterType, customStart, customEnd) => {
    setDateFilter(filterType);
    setCustomStartDate(customStart);
    setCustomEndDate(customEnd);
  };

  const handleCustomDatesChange = (start, end) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
  };

  const isAllSelected = filteredTrades.length > 0 && selectedTradeIds.length === filteredTrades.length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">All Trades</h1>
            <p className="text-slate-400 mt-1">
              {filteredTrades.length} {dateFilter !== 'all' ? 'filtered' : ''} trades
              {selectedTradeIds.length > 0 && (
                <span className="ml-2 text-emerald-400">• {selectedTradeIds.length} selected</span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            {selectedTradeIds.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete {selectedTradeIds.length}
              </Button>
            )}
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

        {/* Stats Cards */}
        {closedTrades.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
              title="Closed Trades"
              value={closedTrades.length}
              subtitle={`${filteredTrades.filter(t => t.status === 'open').length} open`}
              icon={Calendar}
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by symbol, setup, or notes..."
              className="pl-10 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-slate-900/50 border-slate-800 text-white">
              <Filter className="w-4 h-4 mr-2 text-slate-500" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white">All Status</SelectItem>
              <SelectItem value="open" className="text-white">Open</SelectItem>
              <SelectItem value="closed" className="text-white">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-slate-900/50 border-slate-800 text-white">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white">All Types</SelectItem>
              <SelectItem value="long" className="text-white">Long</SelectItem>
              <SelectItem value="short" className="text-white">Short</SelectItem>
            </SelectContent>
          </Select>
          <ColumnCustomizer columns={columns} onChange={handleColumnsChange} />
        </div>

        {/* Trades Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 border border-slate-800/50 rounded-2xl">
            <p className="text-slate-500">No trades found</p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery('')}
                className="text-emerald-400 mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-4 py-4 w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        className="border-slate-600"
                      />
                    </th>
                    {columns.filter(col => col.visible).map(col => (
                      <th key={col.id} className="text-left px-6 py-4 text-sm font-medium text-slate-400">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map((trade) => {
                    const isWin = trade.profit_loss > 0;
                    const isLoss = trade.profit_loss < 0;
                    const isSelected = selectedTradeIds.includes(trade.id);
                    
                    const renderCell = (columnId) => {
                      switch (columnId) {
                        case 'symbol':
                          return (
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                trade.trade_type === 'long' ? "bg-emerald-500/20" : "bg-red-500/20"
                              )}>
                                {trade.trade_type === 'long' ? (
                                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-red-400" />
                                )}
                              </div>
                              <span className="font-semibold">{trade.symbol}</span>
                            </div>
                          );
                        case 'type':
                          return (
                            <Badge variant="outline" className={cn(
                              "capitalize text-xs",
                              trade.trade_type === 'long' ? "border-emerald-500/50 text-emerald-400" : "border-red-500/50 text-red-400"
                            )}>
                              {trade.trade_type}
                            </Badge>
                          );
                        case 'entry':
                          return <span className="text-slate-300">${trade.entry_price}</span>;
                        case 'exit':
                          return <span className="text-slate-300">{trade.exit_price ? `$${trade.exit_price}` : '-'}</span>;
                        case 'qty':
                          return <span className="text-slate-300">{trade.quantity}</span>;
                        case 'pnl':
                          return trade.status === 'closed' && trade.profit_loss !== null ? (
                            <span className={cn(
                              "font-semibold",
                              isWin ? "text-emerald-400" : isLoss ? "text-red-400" : "text-slate-400"
                            )}>
                              {isWin ? '+' : ''}${trade.profit_loss?.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          );
                        case 'date':
                          return (
                            <div className="flex items-center gap-1 text-slate-400 text-sm">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(trade.entry_date), 'MMM d, yyyy')}
                            </div>
                          );
                        case 'status':
                          return (
                            <Badge className={cn(
                              "text-xs",
                              trade.status === 'open' 
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/50" 
                                : "bg-slate-700/50 text-slate-400 border-slate-600"
                            )}>
                              {trade.status}
                            </Badge>
                          );
                        default:
                          return null;
                      }
                    };
                    
                    return (
                      <tr
                        key={trade.id}
                        className={cn(
                          "border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors",
                          isSelected && "bg-emerald-500/5"
                        )}
                      >
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectTrade(trade.id, checked)}
                            className="border-slate-600"
                          />
                        </td>
                        {columns.filter(col => col.visible).map(col => (
                          <td
                            key={col.id}
                            className="px-6 py-4 cursor-pointer"
                            onClick={() => setSelectedTrade(trade)}
                          >
                            {renderCell(col.id)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
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

      {/* Trade Detail Modal */}
      <TradeDetailModal
        trade={selectedTrade}
        open={!!selectedTrade}
        onClose={() => setSelectedTrade(null)}
        onEdit={handleEditTrade}
        onDelete={handleDeleteTrade}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete {selectedTradeIds.length} {selectedTradeIds.length === 1 ? 'trade' : 'trades'}?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. This will permanently delete {selectedTradeIds.length === 1 ? 'this trade' : 'these trades'} from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {bulkDeleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}