import { Trophy } from 'lucide-react';
import StatsCard from '../StatsCard';
import { format } from 'date-fns';

export default function BestDayWidget({ stats }) {
  return (
    <StatsCard
      title="Best Day"
      value={stats.bestDay?.pnl ? `+$${stats.bestDay.pnl.toFixed(2)}` : '$0.00'}
      subtitle={stats.bestDay?.date ? format(new Date(stats.bestDay.date), 'MMM d, yyyy') : 'No data'}
      icon={Trophy}
      info="Highest single-day P&L"
    />
  );
}