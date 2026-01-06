import { TrendingDown } from 'lucide-react';
import StatsCard from '../StatsCard';

export default function LargestDrawdownWidget({ stats }) {
  return (
    <StatsCard
      title="Largest Drawdown"
      value={stats.largestDrawdown ? `-$${Math.abs(stats.largestDrawdown).toFixed(2)}` : '$0.00'}
      icon={TrendingDown}
      info="Maximum peak-to-trough decline"
    />
  );
}