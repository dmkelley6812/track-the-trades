import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, trendUp, className, info }) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900 to-slate-950 p-6",
      "hover:border-slate-700/50 transition-all duration-300",
      className
    )}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-2xl -translate-y-8 translate-x-8" />
      
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-400 tracking-wide uppercase">{title}</p>
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
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trendUp ? "text-emerald-400" : "text-red-400"
            )}>
              <span>{trendUp ? "↑" : "↓"}</span>
              <span>{trend}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-slate-800/50 backdrop-blur-sm">
            <Icon className="w-5 h-5 text-emerald-400" />
          </div>
        )}
      </div>
    </div>
  );
}