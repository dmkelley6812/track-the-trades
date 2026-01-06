import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, getDay } from 'date-fns';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function PnLByDayOfWeekWidget({ trades }) {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.profit_loss !== null);
  
  const dayData = DAYS.map((day, index) => ({
    day,
    pnl: 0,
    count: 0,
  }));

  closedTrades.forEach(trade => {
    const dayIndex = getDay(new Date(trade.entry_date));
    dayData[dayIndex].pnl += trade.profit_loss;
    dayData[dayIndex].count += 1;
  });

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 h-full flex flex-col">
      <h3 className="text-sm font-medium text-slate-400 mb-4">P&L by Day of Week</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dayData}>
          <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: '12px' }} />
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
            {dayData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}