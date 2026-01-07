import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function PnLChart({ trades }) {
  // Calculate cumulative P&L over time
  const chartData = trades
    .filter(t => t.status === 'closed' && t.exit_date)
    .sort((a, b) => new Date(a.exit_date) - new Date(b.exit_date))
    .reduce((acc, trade) => {
      const lastPnL = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
      const cumulative = lastPnL + (trade.profit_loss || 0);
      acc.push({
        date: trade.exit_date,
        pnl: trade.profit_loss || 0,
        cumulative,
        symbol: trade.symbol
      });
      return acc;
    }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-slate-400 text-xs mb-1">
            {format(new Date(data.date), 'MMM d, yyyy')}
          </p>
          <p className="text-white font-semibold">{data.symbol}</p>
          <p className={data.pnl >= 0 ? "text-emerald-400" : "text-red-400"}>
            Trade: ${data.pnl.toFixed(2)}
          </p>
          <p className={data.cumulative >= 0 ? "text-emerald-400" : "text-red-400"}>
            Total: ${data.cumulative.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No closed trades to display
      </div>
    );
  }

  const isPositive = chartData.length > 0 && chartData[chartData.length - 1].cumulative >= 0;

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={0}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
            <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis 
          dataKey="date" 
          stroke="#475569"
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickFormatter={(date) => format(new Date(date), 'MMM d')}
        />
        <YAxis 
          stroke="#475569"
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickFormatter={(val) => `$${val}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="cumulative"
          stroke={isPositive ? "#10b981" : "#ef4444"}
          strokeWidth={2}
          fill="url(#pnlGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}