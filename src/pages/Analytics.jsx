import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { format, subDays, startOfWeek, startOfMonth, parseISO } from 'date-fns';
import { Loader2, TrendingUp, TrendingDown, Clock, Target, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";
import StatsCard from '@/components/dashboard/StatsCard';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trades'],
    queryFn: () => base44.entities.Trade.filter({ created_by: user?.email }),
    enabled: !!user
  });

  // Filter trades by time range
  const filteredTrades = trades.filter(t => {
    const tradeDate = new Date(t.entry_date);
    const cutoff = subDays(new Date(), parseInt(timeRange));
    return tradeDate >= cutoff;
  });

  const closedTrades = filteredTrades.filter(t => t.status === 'closed');

  // Calculate metrics
  const wins = closedTrades.filter(t => t.profit_loss > 0);
  const losses = closedTrades.filter(t => t.profit_loss < 0);
  const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
  const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.profit_loss, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + t.profit_loss, 0)) / losses.length : 0;
  const profitFactor = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : 0;
  const expectancy = closedTrades.length > 0 ? totalPnL / closedTrades.length : 0;
  
  // Best/Worst trade
  const bestTrade = closedTrades.reduce((best, t) => (!best || t.profit_loss > best.profit_loss) ? t : best, null);
  const worstTrade = closedTrades.reduce((worst, t) => (!worst || t.profit_loss < worst.profit_loss) ? t : worst, null);

  // P&L by day of week
  const dayOfWeekData = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
    const dayTrades = closedTrades.filter(t => new Date(t.entry_date).getDay() === idx);
    return {
      day,
      pnl: dayTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0),
      trades: dayTrades.length
    };
  });

  // P&L by symbol
  const symbolData = closedTrades.reduce((acc, t) => {
    if (!acc[t.symbol]) acc[t.symbol] = { symbol: t.symbol, pnl: 0, trades: 0 };
    acc[t.symbol].pnl += t.profit_loss || 0;
    acc[t.symbol].trades += 1;
    return acc;
  }, {});
  const topSymbols = Object.values(symbolData)
    .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl))
    .slice(0, 6);

  // Setup type performance
  const setupData = closedTrades.reduce((acc, t) => {
    const setup = t.setup_type || 'Untagged';
    if (!acc[setup]) acc[setup] = { setup, pnl: 0, wins: 0, losses: 0 };
    acc[setup].pnl += t.profit_loss || 0;
    if (t.profit_loss > 0) acc[setup].wins += 1;
    if (t.profit_loss < 0) acc[setup].losses += 1;
    return acc;
  }, {});
  const setupPerformance = Object.values(setupData).slice(0, 5);

  // Daily P&L trend
  const dailyPnL = closedTrades.reduce((acc, t) => {
    const day = format(new Date(t.exit_date || t.entry_date), 'yyyy-MM-dd');
    if (!acc[day]) acc[day] = { date: day, pnl: 0 };
    acc[day].pnl += t.profit_loss || 0;
    return acc;
  }, {});
  const dailyTrend = Object.values(dailyPnL).sort((a, b) => a.date.localeCompare(b.date));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-slate-400 text-xs mb-1">{label}</p>
          <p className={cn(
            "font-semibold",
            payload[0].value >= 0 ? "text-emerald-400" : "text-red-400"
          )}>
            ${payload[0].value?.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-slate-400 mt-1">Deep dive into your trading performance</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 bg-slate-900/50 border-slate-800 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="7" className="text-white">Last 7 days</SelectItem>
              <SelectItem value="30" className="text-white">Last 30 days</SelectItem>
              <SelectItem value="90" className="text-white">Last 90 days</SelectItem>
              <SelectItem value="365" className="text-white">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatsCard title="Win Rate" value={`${winRate.toFixed(1)}%`} icon={Target} />
          <StatsCard title="Profit Factor" value={profitFactor.toFixed(2)} icon={TrendingUp} />
          <StatsCard title="Expectancy" value={`$${expectancy.toFixed(2)}`} icon={Zap} />
          <StatsCard title="Avg Win" value={`$${avgWin.toFixed(2)}`} icon={TrendingUp} />
          <StatsCard title="Avg Loss" value={`$${avgLoss.toFixed(2)}`} icon={TrendingDown} />
          <StatsCard title="Trades" value={closedTrades.length} icon={Clock} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily P&L Trend */}
          <Card className="bg-slate-900/50 border-slate-800/50 p-6">
            <h3 className="text-lg font-semibold mb-4">Daily P&L Trend</h3>
            {dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#475569"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(d) => format(new Date(d), 'MMM d')}
                  />
                  <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="pnl" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-500">
                No data available
              </div>
            )}
          </Card>

          {/* P&L by Day of Week */}
          <Card className="bg-slate-900/50 border-slate-800/50 p-6">
            <h3 className="text-lg font-semibold mb-4">P&L by Day of Week</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dayOfWeekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="pnl" 
                  radius={[4, 4, 0, 0]}
                >
                  {dayOfWeekData.map((entry, index) => (
                    <Cell key={index} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* More Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Symbols */}
          <Card className="bg-slate-900/50 border-slate-800/50 p-6">
            <h3 className="text-lg font-semibold mb-4">P&L by Symbol</h3>
            {topSymbols.length > 0 ? (
              <div className="space-y-3">
                {topSymbols.map((item, idx) => (
                  <div key={item.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="font-medium">{item.symbol}</span>
                      <span className="text-slate-500 text-sm">({item.trades} trades)</span>
                    </div>
                    <span className={cn(
                      "font-semibold",
                      item.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-500">
                No data available
              </div>
            )}
          </Card>

          {/* Setup Performance */}
          <Card className="bg-slate-900/50 border-slate-800/50 p-6">
            <h3 className="text-lg font-semibold mb-4">Performance by Setup</h3>
            {setupPerformance.length > 0 ? (
              <div className="space-y-3">
                {setupPerformance.map((item) => {
                  const totalTrades = item.wins + item.losses;
                  const wr = totalTrades > 0 ? (item.wins / totalTrades) * 100 : 0;
                  return (
                    <div key={item.setup} className="bg-slate-800/30 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.setup}</span>
                        <span className={cn(
                          "font-semibold",
                          item.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                        )}>
                          {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>{item.wins}W / {item.losses}L</span>
                        <span>{wr.toFixed(0)}% WR</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-500">
                Tag your trades with setup types to see performance
              </div>
            )}
          </Card>
        </div>

        {/* Best/Worst Trades */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          {bestTrade && (
            <Card className="bg-emerald-500/5 border-emerald-500/20 p-6">
              <h3 className="text-sm text-emerald-400 font-medium mb-2">Best Trade</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{bestTrade.symbol}</p>
                  <p className="text-slate-400 text-sm">
                    {format(new Date(bestTrade.entry_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <p className="text-3xl font-bold text-emerald-400">
                  +${bestTrade.profit_loss?.toFixed(2)}
                </p>
              </div>
            </Card>
          )}
          {worstTrade && (
            <Card className="bg-red-500/5 border-red-500/20 p-6">
              <h3 className="text-sm text-red-400 font-medium mb-2">Worst Trade</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{worstTrade.symbol}</p>
                  <p className="text-slate-400 text-sm">
                    {format(new Date(worstTrade.entry_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <p className="text-3xl font-bold text-red-400">
                  ${worstTrade.profit_loss?.toFixed(2)}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}