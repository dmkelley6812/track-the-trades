import { AlertTriangle } from 'lucide-react';
import StatsCard from '../StatsCard';
import { format } from 'date-fns';

export default function WorstDayWidget({ stats, layoutMode = 'default' }) {
  return (
    <StatsCard
      title="Worst Day"
      value={stats.worstDay?.pnl ? `${stats.worstDay.pnl.toFixed(2)}` : '$0.00'}
      subtitle={layoutMode === 'stacked' ? undefined : (stats.worstDay?.date ? format(new Date(stats.worstDay.date), 'MMM d, yyyy') : 'No data')}
      icon={AlertTriangle}
      info="Lowest single-day P&L"
      layoutMode={layoutMode}
    />
  );
}