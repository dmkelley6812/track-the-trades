import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Calendar, TrendingUp, TrendingDown, BarChart2, Edit2, Image as ImageIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";

const MOOD_ICONS = {
  confident: '😎',
  focused: '🎯',
  neutral: '😐',
  anxious: '😰',
  frustrated: '😤'
};

export default function JournalCard({ journal, onEdit }) {
  const isProfit = journal.daily_pnl > 0;
  const isLoss = journal.daily_pnl < 0;
  const coverImage = journal.images?.[0];

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden hover:border-slate-700/50 transition-all group">
      {/* Cover Image */}
      {coverImage ? (
        <div className="w-full h-48 overflow-hidden bg-slate-800">
          <img
            src={coverImage.url}
            alt="Journal cover"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-slate-700" />
        </div>
      )}

      <div className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{MOOD_ICONS[journal.mood] || '📝'}</div>
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400 text-sm">
                {format(new Date(journal.date), 'EEEE, MMM d, yyyy')}
              </span>
            </div>
            {journal.title && (
              <h3 className="font-semibold text-white mt-1">{journal.title}</h3>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(journal)}
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