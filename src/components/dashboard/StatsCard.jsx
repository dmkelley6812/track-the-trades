import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, trendUp, className, info }) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-slate-800/50 bg-slate-900/50 p-4",
      "hover:border-slate-700/50 transition-all duration-200",
      className
    )}>
      <div className="flex items-center justify-center gap-2 mb-3">
        {Icon && (
          <div className="p-1.5 rounded-lg bg-slate-800/50">
            <Icon className="w-4 h-4 text-emerald-400" />
          </div>
        )}
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        {info && (
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