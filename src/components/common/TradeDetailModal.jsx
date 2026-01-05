import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Tag, 
  Edit2, 
  Trash2,
  FileText,
  Clock
} from 'lucide-react';

export default function TradeDetailModal({ trade, open, onClose, onEdit, onDelete }) {
  if (!trade) return null;

  const isWin = trade.profit_loss > 0;
  const isLoss = trade.profit_loss < 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                trade.trade_type === 'long' ? "bg-emerald-500/20" : "bg-red-500/20"
              )}>
                {trade.trade_type === 'long' ? (
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{trade.symbol}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className={cn(
                    "text-xs capitalize",
                    trade.trade_type === 'long' ? "border-emerald-500/50 text-emerald-400" : "border-red-500/50 text-red-400"
                  )}>
                    {trade.trade_type}
                  </Badge>
                  {trade.status === 'open' && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-xs">
                      Open
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* P&L Display */}
          {trade.status === 'closed' && trade.profit_loss !== null && (
            <div className={cn(
              "p-4 rounded-xl",
              isWin ? "bg-emerald-500/10 border border-emerald-500/30" : 
              isLoss ? "bg-red-500/10 border border-red-500/30" : 
              "bg-slate-800/50 border border-slate-700"
            )}>
              <div className="text-center mb-3">
                <p className="text-sm text-slate-400 mb-1">Net P&L</p>
                <p className={cn(
                  "text-3xl font-bold",
                  isWin ? "text-emerald-400" : isLoss ? "text-red-400" : "text-slate-400"
                )}>
                  {isWin ? '+' : ''}${trade.profit_loss?.toFixed(2)}
                  {trade.profit_loss_percent !== undefined && trade.profit_loss_percent !== null && (
                    <span className="text-lg ml-2">
                      ({trade.profit_loss_percent >= 0 ? '+' : ''}{trade.profit_loss_percent?.toFixed(2)}%)
                    </span>
                  )}
                </p>
              </div>
              {trade.profit_loss_gross !== undefined && trade.profit_loss_gross !== null && (
                <div className="flex justify-between text-sm border-t border-slate-700/50 pt-3">
                  <div>
                    <p className="text-slate-500">Gross P&L</p>
                    <p className={cn(
                      "font-medium",
                      trade.profit_loss_gross >= 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {trade.profit_loss_gross >= 0 ? '+' : ''}${trade.profit_loss_gross?.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500">Commissions</p>
                    <p className="font-medium text-slate-400">-${(trade.fees || 0).toFixed(2)}</p>
                  </div>
                </div>
              )}
              {trade.point_value && (
                <p className="text-xs text-slate-500 text-center mt-2">
                  Point Value: ${trade.point_value} • {trade.instrument_type || 'futures'}
                </p>
              )}
            </div>
          )}

          {/* Trade Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/30 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Entry Price</p>
              <p className="font-semibold">${trade.entry_price}</p>
            </div>
            {trade.exit_price && (
              <div className="bg-slate-800/30 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Exit Price</p>
                <p className="font-semibold">${trade.exit_price}</p>
              </div>
            )}
            <div className="bg-slate-800/30 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Quantity</p>
              <p className="font-semibold">{trade.quantity}</p>
            </div>
            {trade.fees > 0 && (
              <div className="bg-slate-800/30 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Fees</p>
                <p className="font-semibold">${trade.fees}</p>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">Entry:</span>
              <span className="text-white">
                {format(new Date(trade.entry_date), 'MMM d, yyyy • h:mm a')}
              </span>
            </div>
            {trade.exit_date && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-slate-400">Exit:</span>
                <span className="text-white">
                  {format(new Date(trade.exit_date), 'MMM d, yyyy • h:mm a')}
                </span>
              </div>
            )}
          </div>

          {/* Setup & Tags */}
          {(trade.setup_type || trade.tags?.length > 0) && (
            <div className="space-y-2">
              {trade.setup_type && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-400">Setup:</span>
                  <span className="text-sm text-white">{trade.setup_type}</span>
                </div>
              )}
              {trade.tags?.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-slate-500" />
                  {trade.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-slate-800 text-slate-300 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {trade.notes && (
            <div className="bg-slate-800/30 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Notes</p>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{trade.notes}</p>
            </div>
          )}

          {/* Source */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Source:</span>
            <Badge variant="outline" className="text-xs capitalize">
              {trade.source?.replace('_', ' ') || 'Manual'}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              onClick={() => onEdit(trade)}
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => onDelete(trade)}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}