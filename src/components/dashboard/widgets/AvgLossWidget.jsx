import { TrendingDown } from 'lucide-react';
import StatsCard from '../StatsCard';

export default function AvgLossWidget({ stats }) {
  return (
    <StatsCard
      title="Average Loss"
      value={stats.avgLoss ? `-$${Math.abs(stats.avgLoss).toFixed(2)}` : '$0.00'}
      icon={TrendingDown}
      info="Average loss from losing trades"
    />
  );
}