import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, getDay } from 'date-fns';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TradeCountByDayWidget({ trades }) {
  const dayData = DAYS.map((day, index) => ({
    day,
    count: 0,
  }));

  trades.forEach(trade => {
    const dayIndex = getDay(new Date(trade.entry_date));
    dayData[dayIndex].count += 1;
  });

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-4">Trade Count by Day</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={dayData}>
          <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}