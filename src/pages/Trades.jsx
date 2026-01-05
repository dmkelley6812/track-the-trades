import { useState } from 'react';
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
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import TradeForm from '@/components/trades/TradeForm';
import TradeDetailModal from '@/components/common/TradeDetailModal';

export default function Trades() {
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trades'],
    queryFn: () => base44.entities.Trade.filter({ created_by: user?.email }, '-entry_date'),
    enabled: !!user
  });

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

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.setup_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trade.status === statusFilter;
    const matchesType = typeFilter === 'all' || trade.trade_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

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

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">All Trades</h1>
            <p className="text-slate-400 mt-1">{trades.length} total trades</p>
          </div>
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
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Symbol</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Type</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Entry</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Exit</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Qty</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">P&L</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Date</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map((trade) => {
                    const isWin = trade.profit_loss > 0;
                    const isLoss = trade.profit_loss < 0;
                    
                    return (
                      <tr
                        key={trade.id}
                        onClick={() => setSelectedTrade(trade)}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
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
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={cn(
                            "capitalize text-xs",
                            trade.trade_type === 'long' ? "border-emerald-500/50 text-emerald-400" : "border-red-500/50 text-red-400"
                          )}>
                            {trade.trade_type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-300">${trade.entry_price}</td>
                        <td className="px-6 py-4 text-slate-300">
                          {trade.exit_price ? `$${trade.exit_price}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-300">{trade.quantity}</td>
                        <td className="px-6 py-4">
                          {trade.status === 'closed' && trade.profit_loss !== null ? (
                            <span className={cn(
                              "font-semibold",
                              isWin ? "text-emerald-400" : isLoss ? "text-red-400" : "text-slate-400"
                            )}>
                              {isWin ? '+' : ''}${trade.profit_loss?.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(trade.entry_date), 'MMM d, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={cn(
                            "text-xs",
                            trade.status === 'open' 
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/50" 
                              : "bg-slate-700/50 text-slate-400 border-slate-600"
                          )}>
                            {trade.status}
                          </Badge>
                        </td>
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
    </div>
  );
}