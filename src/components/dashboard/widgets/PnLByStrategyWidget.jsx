import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function PnLByStrategyWidget({ trades }) {
  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.Strategy.list(),
  });

  const closedTrades = trades.filter(t => t.status === 'closed' && t.profit_loss !== null);
  
  const strategyMap = {};
  strategies.forEach(s => {
    strategyMap[s.id] = { name: s.name, pnl: 0, count: 0 };
  });
  strategyMap['none'] = { name: 'No Strategy', pnl: 0, count: 0 };

  closedTrades.forEach(trade => {
    const key = trade.strategy_id || 'none';
    if (strategyMap[key]) {
      strategyMap[key].pnl += trade.profit_loss;
      strategyMap[key].count += 1;
    }
  });

  const chartData = Object.entries(strategyMap)
    .filter(([_, data]) => data.count > 0)
    .map(([id, data]) => ({
      name: data.name,
      pnl: data.pnl,
    }))
    .sort((a, b) => b.pnl - a.pnl);

  if (chartData.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 h-full flex items-center justify-center">
        <p className="text-slate-500 text-sm">No strategy data available</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 h-full flex flex-col">
      <h3 className="text-sm font-medium text-slate-400 mb-4">P&L by Strategy</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={80} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
            formatter={(value) => [`$${value.toFixed(2)}`, 'P&L']}
          />
          <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}