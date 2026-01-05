import { cn } from "@/lib/utils";

export default function WinRateGauge({ winRate, wins, losses }) {
  const radius = 70;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const progress = (winRate / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="180" height="180" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="url(#winRateGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="winRateGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{winRate.toFixed(1)}%</span>
          <span className="text-sm text-slate-400 mt-1">Win Rate</span>
        </div>
      </div>
      
      <div className="flex gap-8 mt-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-400">{wins}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Wins</p>
        </div>
        <div className="w-px bg-slate-700" />
        <div className="text-center">
          <p className="text-2xl font-bold text-red-400">{losses}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Losses</p>
        </div>
      </div>
    </div>
  );
}