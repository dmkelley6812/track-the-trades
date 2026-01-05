import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Save, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function TradeForm({ trade, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    symbol: trade?.symbol || '',
    trade_type: trade?.trade_type || 'long',
    entry_price: trade?.entry_price || '',
    exit_price: trade?.exit_price || '',
    quantity: trade?.quantity || '',
    entry_date: trade?.entry_date ? new Date(trade.entry_date).toISOString().slice(0, 16) : '',
    exit_date: trade?.exit_date ? new Date(trade.exit_date).toISOString().slice(0, 16) : '',
    status: trade?.status || 'closed',
    fees: trade?.fees || 0,
    notes: trade?.notes || '',
    setup_type: trade?.setup_type || '',
    tags: trade?.tags?.join(', ') || ''
  });

  const [isOpen, setIsOpen] = useState(formData.status === 'open');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatePnL = () => {
    if (!formData.entry_price || !formData.exit_price || !formData.quantity) return null;
    
    const entry = parseFloat(formData.entry_price);
    const exit = parseFloat(formData.exit_price);
    const qty = parseFloat(formData.quantity);
    const fees = parseFloat(formData.fees) || 0;
    
    let pnl;
    if (formData.trade_type === 'long') {
      pnl = (exit - entry) * qty - fees;
    } else {
      pnl = (entry - exit) * qty - fees;
    }
    
    const pnlPercent = ((pnl + fees) / (entry * qty)) * 100;
    
    return { pnl, pnlPercent };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const pnlCalc = calculatePnL();
    
    const submitData = {
      ...formData,
      entry_price: parseFloat(formData.entry_price),
      exit_price: formData.exit_price ? parseFloat(formData.exit_price) : null,
      quantity: parseFloat(formData.quantity),
      fees: parseFloat(formData.fees) || 0,
      status: isOpen ? 'open' : 'closed',
      profit_loss: pnlCalc?.pnl || null,
      profit_loss_percent: pnlCalc?.pnlPercent || null,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      source: 'manual'
    };

    if (!isOpen && !formData.exit_date) {
      submitData.exit_date = formData.entry_date;
    }

    onSubmit(submitData);
  };

  const pnlPreview = calculatePnL();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <h2 className="text-xl font-semibold text-white">
          {trade ? 'Edit Trade' : 'New Trade'}
        </h2>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <Label className="text-slate-300">Symbol *</Label>
          <Input
            value={formData.symbol}
            onChange={(e) => handleChange('symbol', e.target.value.toUpperCase())}
            placeholder="AAPL"
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            required
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <Label className="text-slate-300">Direction *</Label>
          <Select value={formData.trade_type} onValueChange={(v) => handleChange('trade_type', v)}>
            <SelectTrigger className="mt-1.5 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="long" className="text-white">Long</SelectItem>
              <SelectItem value="short" className="text-white">Short</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-slate-300">Entry Price *</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.entry_price}
            onChange={(e) => handleChange('entry_price', e.target.value)}
            placeholder="0.00"
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            required
          />
        </div>

        <div>
          <Label className="text-slate-300">Quantity *</Label>
          <Input
            type="number"
            step="1"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            placeholder="100"
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            required
          />
        </div>

        <div className="col-span-2">
          <Label className="text-slate-300">Entry Date & Time *</Label>
          <Input
            type="datetime-local"
            value={formData.entry_date}
            onChange={(e) => handleChange('entry_date', e.target.value)}
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
            required
          />
        </div>

        <div className="col-span-2 flex items-center gap-3 py-2">
          <Switch
            checked={isOpen}
            onCheckedChange={(checked) => {
              setIsOpen(checked);
              if (checked) {
                handleChange('exit_price', '');
                handleChange('exit_date', '');
              }
            }}
          />
          <Label className="text-slate-300">Trade is still open</Label>
        </div>

        {!isOpen && (
          <>
            <div>
              <Label className="text-slate-300">Exit Price</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.exit_price}
                onChange={(e) => handleChange('exit_price', e.target.value)}
                placeholder="0.00"
                className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <Label className="text-slate-300">Fees</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.fees}
                onChange={(e) => handleChange('fees', e.target.value)}
                placeholder="0.00"
                className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="col-span-2">
              <Label className="text-slate-300">Exit Date & Time</Label>
              <Input
                type="datetime-local"
                value={formData.exit_date}
                onChange={(e) => handleChange('exit_date', e.target.value)}
                className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            {pnlPreview && (
              <div className={cn(
                "col-span-2 p-4 rounded-xl",
                pnlPreview.pnl >= 0 ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/30"
              )}>
                <p className="text-sm text-slate-400 mb-1">Estimated P&L</p>
                <p className={cn(
                  "text-2xl font-bold",
                  pnlPreview.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  {pnlPreview.pnl >= 0 ? '+' : ''}${pnlPreview.pnl.toFixed(2)}
                  <span className="text-base ml-2">
                    ({pnlPreview.pnlPercent >= 0 ? '+' : ''}{pnlPreview.pnlPercent.toFixed(2)}%)
                  </span>
                </p>
              </div>
            )}
          </>
        )}

        <div className="col-span-2">
          <Label className="text-slate-300">Setup Type</Label>
          <Input
            value={formData.setup_type}
            onChange={(e) => handleChange('setup_type', e.target.value)}
            placeholder="e.g., Breakout, Gap Fill, VWAP Bounce"
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>

        <div className="col-span-2">
          <Label className="text-slate-300">Tags (comma separated)</Label>
          <Input
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="momentum, earnings, scalp"
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>

        <div className="col-span-2">
          <Label className="text-slate-300">Notes</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="What was your reasoning? What did you learn?"
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px]"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-800">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {trade ? 'Update Trade' : 'Save Trade'}
        </Button>
      </div>
    </form>
  );
}