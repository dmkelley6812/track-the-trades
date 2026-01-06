import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Save, Loader2, Upload, Star, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import StrategySelect from '@/components/common/StrategySelect';
import KeywordInput from '@/components/common/KeywordInput';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const EMOTIONS = [
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'anxious', emoji: '😬', label: 'Anxious' },
  { value: 'frustrated', emoji: '😤', label: 'Frustrated' },
  { value: 'angry', emoji: '😡', label: 'Angry' },
  { value: 'confident', emoji: '😄', label: 'Confident' },
  { value: 'calm', emoji: '😎', label: 'Calm' },
  { value: 'greedy', emoji: '🤑', label: 'Greedy' },
  { value: 'fearful', emoji: '😨', label: 'Fearful' },
  { value: 'overwhelmed', emoji: '🤯', label: 'Overwhelmed' },
  { value: 'other', emoji: '✏️', label: 'Other' }
];

const POSITIVE_TRAITS = [
  'PATIENT', 'DISCIPLINED', 'FOLLOWED_PLAN', 'GOOD_RISK_MANAGEMENT',
  'PERFECT_ENTRY', 'GOOD_EXIT', 'LET_WINNER_RUN', 'CUT_LOSS_QUICKLY'
];

const NEGATIVE_TRAITS = [
  'FOMO', 'ENTERED_LATE', 'OVERTRADING', 'REVENGE_TRADE',
  'MOVED_STOP_BADLY', 'NO_STOP', 'HESITATED', 'TOOK_PROFIT_TOO_EARLY',
  'ADDED_TO_LOSER', 'BROKE_RULES'
];

export default function TradeFormEnhanced({ trade, onSubmit, onCancel, isLoading }) {
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
    point_value: trade?.point_value || '',
    notes: trade?.notes || '',
    setup_type: trade?.setup_type || '',
    tags: trade?.tags?.join(', ') || '',
    strategy_id: trade?.strategy_id || '',
    keywords: trade?.keywords || [],
    screenshots: trade?.screenshots || [],
    stop_loss_outcome: trade?.stop_loss_outcome || '',
    take_profit_outcome: trade?.take_profit_outcome || '',
    execution_rating: trade?.execution_rating || 0,
    plan_adherence_rating: trade?.plan_adherence_rating || 0,
    emotion: trade?.emotion || '',
    emotion_other: trade?.emotion_other || '',
    positive_traits: trade?.positive_traits || [],
    negative_traits: trade?.negative_traits || [],
    trade_notes: trade?.trade_notes || ''
  });

  const [isOpen, setIsOpen] = useState(formData.status === 'open');
  const [uploading, setUploading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const result = await base44.integrations.Core.UploadFile({ file });
        return {
          url: result.file_url,
          filename: file.name,
          uploadedAt: new Date().toISOString()
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      handleChange('screenshots', [...formData.screenshots, ...uploadedImages]);
      toast.success(`${uploadedImages.length} image(s) uploaded`);
    } catch (err) {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeScreenshot = (index) => {
    const newScreenshots = formData.screenshots.filter((_, idx) => idx !== index);
    handleChange('screenshots', newScreenshots);
  };

  const toggleTrait = (type, trait) => {
    const field = type === 'positive' ? 'positive_traits' : 'negative_traits';
    const current = formData[field];
    const updated = current.includes(trait)
      ? current.filter(t => t !== trait)
      : [...current, trait];
    handleChange(field, updated);
  };

  const calculatePnL = () => {
    if (!formData.entry_price || !formData.exit_price || !formData.quantity) return null;
    
    const entry = parseFloat(formData.entry_price);
    const exit = parseFloat(formData.exit_price);
    const qty = parseFloat(formData.quantity);
    const fees = parseFloat(formData.fees) || 0;
    const point_value = parseFloat(formData.point_value) || 1;
    
    let pnl;
    if (formData.trade_type === 'long') {
      pnl = (exit - entry) * point_value * qty - fees;
    } else {
      pnl = (entry - exit) * point_value * qty - fees;
    }
    
    return pnl;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      entry_price: parseFloat(formData.entry_price),
      exit_price: formData.exit_price ? parseFloat(formData.exit_price) : null,
      quantity: parseFloat(formData.quantity),
      fees: parseFloat(formData.fees) || 0,
      point_value: formData.point_value ? parseFloat(formData.point_value) : undefined,
      status: isOpen ? 'open' : 'closed',
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      source: trade?.source || 'manual',
      execution_rating: formData.execution_rating || undefined,
      plan_adherence_rating: formData.plan_adherence_rating || undefined,
      emotion: formData.emotion || undefined,
      emotion_other: formData.emotion === 'other' ? formData.emotion_other : undefined
    };

    if (!isOpen && !formData.exit_date) {
      submitData.exit_date = formData.entry_date;
    }

    onSubmit(submitData);
  };

  const pnlPreview = calculatePnL();
  const showStopLossOutcome = !isOpen && pnlPreview !== null && pnlPreview < 0;
  const showTakeProfitOutcome = !isOpen && pnlPreview !== null && pnlPreview > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
        <h2 className="text-xl font-semibold text-white">
          {trade ? 'Edit Trade' : 'New Trade'}
        </h2>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Basic Trade Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">Trade Details</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <Label className="text-slate-300">Symbol *</Label>
            <Input
              value={formData.symbol}
              onChange={(e) => handleChange('symbol', e.target.value.toUpperCase())}
              placeholder="AAPL"
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
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
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
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
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
              required
            />
          </div>

          <div className="col-span-2">
            <Label className="text-slate-300">Point Value</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.point_value}
              onChange={(e) => handleChange('point_value', e.target.value)}
              placeholder="1 (for stocks) or multiplier (for futures)"
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

          <div className="col-span-2">
            <Label className="text-slate-300">Entry Date *</Label>
            <Input
              type="datetime-local"
              value={formData.entry_date}
              onChange={(e) => handleChange('entry_date', e.target.value)}
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
              required
            />
          </div>

          <div className="col-span-2 flex items-center gap-3 py-2">
            <Switch checked={isOpen} onCheckedChange={setIsOpen} />
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
                  className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300">Fees</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.fees}
                  onChange={(e) => handleChange('fees', e.target.value)}
                  className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div className="col-span-2">
                <Label className="text-slate-300">Exit Date</Label>
                <Input
                  type="datetime-local"
                  value={formData.exit_date}
                  onChange={(e) => handleChange('exit_date', e.target.value)}
                  className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Screenshots */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">Screenshots</h3>
        
        <div className="flex flex-wrap gap-2">
          {formData.screenshots.map((screenshot, idx) => (
            <div key={idx} className="relative group">
              <img 
                src={screenshot.url} 
                alt={`Screenshot ${idx + 1}`}
                className="w-24 h-24 object-cover rounded-lg border border-slate-700"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeScreenshot(idx)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          
          <label className="w-24 h-24 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-slate-600 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            ) : (
              <Upload className="w-6 h-6 text-slate-500" />
            )}
          </label>
        </div>
      </div>

      {/* Strategy & Keywords */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">Strategy & Keywords</h3>
        
        <div>
          <Label className="text-slate-300">Strategy</Label>
          <div className="mt-1.5">
            <StrategySelect
              value={formData.strategy_id}
              onChange={(value) => handleChange('strategy_id', value)}
            />
          </div>
        </div>

        <div>
          <Label className="text-slate-300">Keywords</Label>
          <div className="mt-1.5">
            <KeywordInput
              keywords={formData.keywords}
              onChange={(keywords) => handleChange('keywords', keywords)}
              placeholder="e.g., NY open, high volatility"
            />
          </div>
        </div>
      </div>

      {/* Outcome Classification */}
      {!isOpen && (
        <>
          {showStopLossOutcome && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-red-400 uppercase tracking-wide">Stop Loss Outcome</h3>
              <Select value={formData.stop_loss_outcome} onValueChange={(v) => handleChange('stop_loss_outcome', v)}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Select outcome..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="NO_STOP_USED">No Stop Used</SelectItem>
                  <SelectItem value="STOP_USED_APPROPRIATE">Stop Used Appropriately</SelectItem>
                  <SelectItem value="STOP_TOO_TIGHT">Stop Too Tight</SelectItem>
                  <SelectItem value="STOP_TOO_WIDE">Stop Too Wide</SelectItem>
                  <SelectItem value="MOVED_STOP_BADLY">Moved Stop Badly</SelectItem>
                  <SelectItem value="UNKNOWN">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showTakeProfitOutcome && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">Take Profit Outcome</h3>
              <Select value={formData.take_profit_outcome} onValueChange={(v) => handleChange('take_profit_outcome', v)}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Select outcome..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="TARGET_HIT">Target Hit</SelectItem>
                  <SelectItem value="EXITED_TOO_SOON">Exited Too Soon</SelectItem>
                  <SelectItem value="MOVED_STOP_TOO_SOON_TAKEN_OUT">Moved Stop Too Soon/Taken Out</SelectItem>
                  <SelectItem value="SCALED_OUT_WELL">Scaled Out Well</SelectItem>
                  <SelectItem value="LET_WINNER_RUN">Let Winner Run</SelectItem>
                  <SelectItem value="UNKNOWN">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      {/* Ratings */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">Performance Ratings</h3>
        
        <div>
          <Label className="text-slate-300 mb-2 block">Execution Rating</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleChange('execution_rating', rating === formData.execution_rating ? 0 : rating)}
                className="p-2 hover:bg-slate-800 rounded transition-colors"
              >
                <Star
                  className={cn(
                    "w-6 h-6",
                    rating <= formData.execution_rating ? "fill-amber-400 text-amber-400" : "text-slate-600"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-slate-300 mb-2 block">Plan Adherence Rating</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleChange('plan_adherence_rating', rating === formData.plan_adherence_rating ? 0 : rating)}
                className="p-2 hover:bg-slate-800 rounded transition-colors"
              >
                <Star
                  className={cn(
                    "w-6 h-6",
                    rating <= formData.plan_adherence_rating ? "fill-emerald-400 text-emerald-400" : "text-slate-600"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Emotion */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">Emotional State</h3>
        <div className="grid grid-cols-5 gap-2">
          {EMOTIONS.map((emotion) => (
            <button
              key={emotion.value}
              type="button"
              onClick={() => handleChange('emotion', emotion.value === formData.emotion ? '' : emotion.value)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all hover:bg-slate-800/50",
                formData.emotion === emotion.value ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700"
              )}
            >
              <span className="text-2xl">{emotion.emoji}</span>
              <span className="text-xs text-slate-400">{emotion.label}</span>
            </button>
          ))}
        </div>
        {formData.emotion === 'other' && (
          <Input
            value={formData.emotion_other}
            onChange={(e) => handleChange('emotion_other', e.target.value)}
            placeholder="Describe your emotion..."
            className="bg-slate-800/50 border-slate-700 text-white"
          />
        )}
      </div>

      {/* Behavioral Traits */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">Behavioral Traits</h3>
        
        <div>
          <Label className="text-slate-300 mb-2 block">Positive Traits</Label>
          <div className="flex flex-wrap gap-2">
            {POSITIVE_TRAITS.map((trait) => (
              <button
                key={trait}
                type="button"
                onClick={() => toggleTrait('positive', trait)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-lg border transition-all",
                  formData.positive_traits.includes(trait)
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                    : "bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-600"
                )}
              >
                {trait.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-slate-300 mb-2 block">Negative Traits</Label>
          <div className="flex flex-wrap gap-2">
            {NEGATIVE_TRAITS.map((trait) => (
              <button
                key={trait}
                type="button"
                onClick={() => toggleTrait('negative', trait)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-lg border transition-all",
                  formData.negative_traits.includes(trait)
                    ? "bg-red-500/20 border-red-500/50 text-red-300"
                    : "bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-600"
                )}
              >
                {trait.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trade Notes */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wide">Trade Notes</h3>
        <Textarea
          value={formData.trade_notes}
          onChange={(e) => handleChange('trade_notes', e.target.value)}
          placeholder="Plan vs actual, lessons learned, context..."
          className="bg-slate-800/50 border-slate-700 text-white min-h-[120px]"
        />
      </div>

      {/* Legacy Fields */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Additional Info</h3>
        
        <div>
          <Label className="text-slate-300">Setup Type</Label>
          <Input
            value={formData.setup_type}
            onChange={(e) => handleChange('setup_type', e.target.value)}
            placeholder="e.g., Breakout, VWAP Bounce"
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
          />
        </div>

        <div>
          <Label className="text-slate-300">Tags (comma separated)</Label>
          <Input
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="momentum, earnings"
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
          />
        </div>

        <div>
          <Label className="text-slate-300">Notes</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Additional observations..."
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-white min-h-[80px]"
          />
        </div>
      </div>

      {/* Submit Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-800 sticky bottom-0 bg-slate-900">
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