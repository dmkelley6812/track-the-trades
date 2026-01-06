import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Calendar, TrendingUp, TrendingDown, BarChart2, Edit2, Image as ImageIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MOOD_ICONS = {
  confident: '😎',
  focused: '🎯',
  neutral: '😐',
  anxious: '😰',
  frustrated: '😤'
};

const JOURNAL_TYPE_CONFIG = {
  TRADE: { label: 'Trade', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  DAY: { label: 'Daily', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  GENERAL: { label: 'General', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' }
};

export default function JournalCard({ journal, onEdit, onClick }) {
  const isProfit = journal.daily_pnl > 0;
  const isLoss = journal.daily_pnl < 0;
  const coverImage = journal.images?.[0];
  const journalType = journal.journal_type || 'GENERAL';
  const typeConfig = JOURNAL_TYPE_CONFIG[journalType];

  return (
    <div 
      onClick={onClick}
      className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden hover:border-slate-700/50 transition-all group cursor-pointer"
    >
      {/* Cover Image */}
      {coverImage && (
        <div className="w-full h-48 overflow-hidden bg-slate-800">
          <img
            src={coverImage.url}
            alt="Journal cover"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={cn("text-xs", typeConfig.color)}>
              {typeConfig.label}
            </Badge>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs">
              {format(new Date(journal.date), 'MMM d, yyyy')}
            </span>
          </div>
          {journal.title && (
            <h3 className="font-semibold text-white">{journal.title}</h3>
          )}
          {journal.linked_trade_ids?.length > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              {journal.linked_trade_ids.length} linked trade{journal.linked_trade_ids.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(journal);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 hover:bg-slate-800"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      </div>

      {(journal.daily_pnl !== null || journal.trades_count !== null) && (
        <div className="flex gap-4 mb-4">
          {journal.daily_pnl !== null && (
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg",
              isProfit ? "bg-emerald-500/10" : isLoss ? "bg-red-500/10" : "bg-slate-800/50"
            )}>
              {isProfit ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : isLoss ? (
                <TrendingDown className="w-4 h-4 text-red-400" />
              ) : null}
              <span className={cn(
                "font-medium",
                isProfit ? "text-emerald-400" : isLoss ? "text-red-400" : "text-slate-400"
              )}>
                {isProfit ? '+' : ''}${journal.daily_pnl?.toFixed(2)}
              </span>
            </div>
          )}
          {journal.trades_count !== null && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50">
              <BarChart2 className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">{journal.trades_count} trades</span>
            </div>
          )}
        </div>
      )}

      {journal.content && (
        <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
          {journal.content}
        </p>
      )}

      {journal.lessons_learned && (
        <div className="mt-3 pt-3 border-t border-slate-800/50">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Lesson</p>
          <p className="text-sm text-slate-400 line-clamp-2">{journal.lessons_learned}</p>
        </div>
      )}

      {journal.images?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/50 flex items-center gap-2 text-slate-500">
          <ImageIcon className="w-4 h-4" />
          <span className="text-sm">{journal.images.length} {journal.images.length === 1 ? 'image' : 'images'}</span>
        </div>
      )}
      </div>
    </div>
  );
}