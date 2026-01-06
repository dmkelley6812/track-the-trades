import { TrendingUp } from 'lucide-react';
import StatsCard from '../StatsCard';

export default function AvgWinWidget({ stats }) {
  return (
    <StatsCard
      title="Average Win"
      value={stats.avgWin ? `$${stats.avgWin.toFixed(2)}` : '$0.00'}
      icon={TrendingUp}
      info="Average profit from winning trades"
    />
  );
}