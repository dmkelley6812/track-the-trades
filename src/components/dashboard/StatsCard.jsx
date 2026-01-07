import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, trendUp, className, info, layoutMode = 'default' }) {
  
  if (layoutMode === 'stacked') {
    return (
      <div className="h-full flex items-center justify-between px-3 py-2 bg-slate-800/30">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide truncate">{title}</p>
          <div className="text-sm font-bold text-white mt-0.5 truncate">{value}</div>
        </div>
        {Icon && (
          <div className="ml-2 w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-3 h-3 text-emerald-400" />
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-slate-800/50 bg-slate-900/50 p-4 h-full",
      "hover:border-slate-700/50 transition-all duration-200 flex flex-col justify-center",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        {Icon && (
          <div className="p-1.5 rounded-lg bg-slate-800/50">
            <Icon className="w-4 h-4 text-emerald-400" />
          </div>
        )}
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider text-center flex-1">{title}</p>
        {info ? (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button className="text-slate-500 hover:text-slate-300 transition-colors">
                  <Info className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-slate-800 border-slate-700 text-slate-100">
                <p className="text-sm">{info}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="w-[22px]" />
        )}
      </div>

      <div className="space-y-1 text-center">
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        {subtitle && (
          <p className="text-xs text-slate-500">{subtitle}</p>
        )}
        {trend !== undefined && (
          <div className={cn(
            "flex items-center justify-center gap-1 text-xs font-medium mt-1",
            trendUp ? "text-emerald-400" : "text-red-400"
          )}>
            <span>{trendUp ? "↑" : "↓"}</span>
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}