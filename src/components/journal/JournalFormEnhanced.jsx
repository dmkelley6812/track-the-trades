import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, Loader2, Upload, Trash2, Star, Plus, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import StrategySelect from '@/components/common/StrategySelect';
import KeywordInput from '@/components/common/KeywordInput';
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const JOURNAL_TYPES = [
  { value: 'GENERAL', label: 'General', description: 'Free-form reflection or notes' },
  { value: 'TRADE', label: 'Trade Journal', description: 'Deep dive on specific trades' },
  { value: 'DAY', label: 'Daily Journal', description: 'End-of-day review and planning' }
];

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

const DAY_MOODS = [
  { value: 'great', emoji: '😄', label: 'Great' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'off', emoji: '😕', label: 'Off' },
  { value: 'bad', emoji: '😣', label: 'Bad' }
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

export default function JournalFormEnhanced({ journal, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    journal_type: journal?.journal_type || 'GENERAL',
    date: journal?.date || format(new Date(), 'yyyy-MM-dd'),
    title: journal?.title || '',
    content: journal?.content || '',
    images: journal?.images || [],
    strategy_id: journal?.strategy_id || '',
    keywords: journal?.keywords || [],
    linked_trade_ids: journal?.linked_trade_ids || [],
    // Day journal fields
    journal_date: journal?.journal_date || format(new Date(), 'yyyy-MM-dd'),
    day_performance_rating: journal?.day_performance_rating || 0,
    day_mood: journal?.day_mood || '',
    day_notes_what_worked: journal?.day_notes_what_worked || '',
    day_notes_what_to_improve: journal?.day_notes_what_to_improve || '',
    // Trade journal fields
    execution_rating: journal?.execution_rating || 0,
    emotion: journal?.emotion || '',
    emotion_other: journal?.emotion_other || '',
    positive_traits: journal?.positive_traits || [],
    negative_traits: journal?.negative_traits || [],
    stop_loss_outcome: journal?.stop_loss_outcome || '',
    take_profit_outcome: journal?.take_profit_outcome || ''
  });

  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTradeSelector, setShowTradeSelector] = useState(false);
  const fileInputRef = useRef(null);

  const { data: allTrades = [] } = useQuery({
    queryKey: ['trades'],
    queryFn: () => base44.entities.Trade.list('-entry_date'),
    enabled: formData.journal_type === 'TRADE' || formData.journal_type === 'DAY'
  });

  const { data: selectedTrades = [] } = useQuery({
    queryKey: ['selected-trades', formData.linked_trade_ids],
    queryFn: async () => {
      if (formData.linked_trade_ids.length === 0) return [];
      const trades = await Promise.all(
        formData.linked_trade_ids.map(id => 
          base44.entities.Trade.filter({ id }).then(res => res[0])
        )
      );
      return trades.filter(Boolean);
    },
    enabled: formData.linked_trade_ids.length > 0
  });

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
      handleChange('images', [...formData.images, ...uploadedImages]);
      toast.success(`${uploadedImages.length} image(s) uploaded`);
    } catch (err) {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, idx) => idx !== index);
    handleChange('images', newImages);
  };

  const toggleTrait = (type, trait) => {
    const field = type === 'positive' ? 'positive_traits' : 'negative_traits';
    const current = formData[field];
    const updated = current.includes(trait)
      ? current.filter(t => t !== trait)
      : [...current, trait];
    handleChange(field, updated);
  };

  const toggleTrade = (tradeId) => {
    const current = formData.linked_trade_ids;
    const updated = current.includes(tradeId)
      ? current.filter(id => id !== tradeId)
      : [...current, tradeId];
    handleChange('linked_trade_ids', updated);
    setShowTradeSelector(false);
  };

  const linkAllTradesForDate = async () => {
    const targetDate = formData.journal_date;
    const tradesOnDate = allTrades.filter(t => {
      if (!t.exit_date || t.status !== 'closed') return false;
      const exitDate = format(new Date(t.exit_date), 'yyyy-MM-dd');
      return exitDate === targetDate;
    });
    
    if (tradesOnDate.length === 0) {
      toast.info('No closed trades found for this date');
      return;
    }

    handleChange('linked_trade_ids', tradesOnDate.map(t => t.id));
    toast.success(`Linked ${tradesOnDate.length} trade(s) from ${format(new Date(targetDate), 'MMM d')}`);
  };

  const primaryTrade = selectedTrades[0];
  const showStopLossOutcome = primaryTrade && primaryTrade.profit_loss < 0;
  const showTakeProfitOutcome = primaryTrade && primaryTrade.profit_loss > 0;

  const filteredTrades = allTrades.filter(trade => 
    searchQuery ? 
    trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) :
    true
  ).slice(0, 20);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      execution_rating: formData.execution_rating || undefined,
      day_performance_rating: formData.day_performance_rating || undefined,
      emotion: formData.emotion || undefined,
      emotion_other: formData.emotion === 'other' ? formData.emotion_other : undefined,
      day_mood: formData.day_mood || undefined
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[85vh] overflow-y-auto px-1">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
        <h2 className="text-xl font-semibold text-white">
          {journal ? 'Edit Journal Entry' : 'New Journal Entry'}
        </h2>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Journal Type Selector */}
      {!journal && (
        <div className="space-y-3">
          <Label className="text-slate-300">Journal Type</Label>
          <div className="grid grid-cols-3 gap-3">
            {JOURNAL_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleChange('journal_type', type.value)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all text-left",
                  formData.journal_type === type.value
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-700 hover:border-slate-600"
                )}
              >
                <p className="font-medium text-white">{type.label}</p>
                <p className="text-xs text-slate-400 mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GENERAL Journal Fields */}
      {formData.journal_type === 'GENERAL' && (
        <div className="space-y-4">
          <div>
            <Label className="text-slate-300">Date</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
              required
            />
          </div>

          <div>
            <Label className="text-slate-300">Title (optional)</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Entry title..."
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

          <div>
            <Label className="text-slate-300">Content</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Your notes and reflections..."
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white min-h-[200px]"
            />
          </div>

          <div>
            <Label className="text-slate-300">Keywords</Label>
            <div className="mt-1.5">
              <KeywordInput
                keywords={formData.keywords}
                onChange={(keywords) => handleChange('keywords', keywords)}
              />
            </div>
          </div>
        </div>
      )}

      {/* TRADE Journal Fields */}
      {formData.journal_type === 'TRADE' && (
        <div className="space-y-6">
          {/* Link Trades */}
          <div className="space-y-3">
            <Label className="text-slate-300">Linked Trades</Label>
            
            {selectedTrades.length > 0 && (
              <div className="space-y-2 mb-3">
                {selectedTrades.map(trade => (
                  <div key={trade.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                        trade.trade_type === 'long' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      )}>
                        {trade.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{trade.symbol}</p>
                        <p className="text-xs text-slate-400">
                          {format(new Date(trade.entry_date), 'MMM d, yyyy')}
                          {trade.profit_loss !== null && (
                            <span className={cn(
                              "ml-2",
                              trade.profit_loss >= 0 ? "text-emerald-400" : "text-red-400"
                            )}>
                              {trade.profit_loss >= 0 ? '+' : ''}${trade.profit_loss.toFixed(2)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleTrade(trade.id)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowTradeSelector(true)}
                placeholder="Search trades by symbol..."
                className="bg-slate-800/50 border-slate-700 text-white"
              />

              {showTradeSelector && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowTradeSelector(false)}
                  />
                  <div className="absolute z-20 w-full mt-1">
                    <ScrollArea className="h-48 border border-slate-700 rounded-lg bg-slate-900 shadow-xl">
                      <div className="p-2 space-y-1">
                        {filteredTrades.map(trade => (
                          <button
                            key={trade.id}
                            type="button"
                            onClick={() => toggleTrade(trade.id)}
                            className={cn(
                              "w-full flex items-center justify-between p-2 rounded-lg transition-colors text-left",
                              formData.linked_trade_ids.includes(trade.id)
                                ? "bg-emerald-500/20 border border-emerald-500/30"
                                : "hover:bg-slate-800/50"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{trade.symbol}</span>
                              <span className="text-xs text-slate-400">
                                {format(new Date(trade.entry_date), 'MMM d')}
                              </span>
                            </div>
                            {trade.profit_loss !== null && (
                              <span className={cn(
                                "text-sm font-medium",
                                trade.profit_loss >= 0 ? "text-emerald-400" : "text-red-400"
                              )}>
                                {trade.profit_loss >= 0 ? '+' : ''}${trade.profit_loss.toFixed(2)}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </>
              )}
            </div>
          </div>

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
              />
            </div>
          </div>

          {/* Execution Rating */}
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

          {/* Emotion */}
          <div className="space-y-3">
            <Label className="text-slate-300">Emotional State</Label>
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

          {/* Conditional Outcomes */}
          {showStopLossOutcome && (
            <div>
              <Label className="text-slate-300">Stop Loss Outcome</Label>
              <Select value={formData.stop_loss_outcome} onValueChange={(v) => handleChange('stop_loss_outcome', v)}>
                <SelectTrigger className="mt-1.5 bg-slate-800/50 border-slate-700 text-white">
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
            <div>
              <Label className="text-slate-300">Take Profit Outcome</Label>
              <Select value={formData.take_profit_outcome} onValueChange={(v) => handleChange('take_profit_outcome', v)}>
                <SelectTrigger className="mt-1.5 bg-slate-800/50 border-slate-700 text-white">
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

          <div>
            <Label className="text-slate-300">Trade Notes</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Plan vs actual, lessons learned, context..."
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white min-h-[120px]"
            />
          </div>
        </div>
      )}

      {/* DAY Journal Fields */}
      {formData.journal_type === 'DAY' && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-slate-300">Journal Date</Label>
              <Input
                type="date"
                value={formData.journal_date}
                onChange={(e) => handleChange('journal_date', e.target.value)}
                className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
                required
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={linkAllTradesForDate}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Link Trades
              </Button>
            </div>
          </div>

          {formData.linked_trade_ids.length > 0 && (
            <div className="bg-slate-800/30 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-2">{formData.linked_trade_ids.length} linked trade(s)</p>
              <div className="space-y-2">
                {selectedTrades.map(trade => (
                  <div key={trade.id} className="flex items-center justify-between text-sm">
                    <span className="text-white">{trade.symbol}</span>
                    <span className={cn(
                      "font-medium",
                      trade.profit_loss >= 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {trade.profit_loss >= 0 ? '+' : ''}${trade.profit_loss?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label className="text-slate-300 mb-2 block">Day Performance Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleChange('day_performance_rating', rating === formData.day_performance_rating ? 0 : rating)}
                  className="p-2 hover:bg-slate-800 rounded transition-colors"
                >
                  <Star
                    className={cn(
                      "w-6 h-6",
                      rating <= formData.day_performance_rating ? "fill-emerald-400 text-emerald-400" : "text-slate-600"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-slate-300">Day Mood</Label>
            <div className="grid grid-cols-5 gap-2">
              {DAY_MOODS.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => handleChange('day_mood', mood.value === formData.day_mood ? '' : mood.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all hover:bg-slate-800/50",
                    formData.day_mood === mood.value ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700"
                  )}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs text-slate-400">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-slate-300">What Worked Today?</Label>
            <Textarea
              value={formData.day_notes_what_worked}
              onChange={(e) => handleChange('day_notes_what_worked', e.target.value)}
              placeholder="What strategies, decisions, or behaviors worked well?"
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white min-h-[100px]"
            />
          </div>

          <div>
            <Label className="text-slate-300">What Needs Improvement?</Label>
            <Textarea
              value={formData.day_notes_what_to_improve}
              onChange={(e) => handleChange('day_notes_what_to_improve', e.target.value)}
              placeholder="What could have been better? What will you focus on?"
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white min-h-[100px]"
            />
          </div>

          <div>
            <Label className="text-slate-300">Plan for Tomorrow</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Goals, setups to watch, focus areas..."
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white min-h-[100px]"
            />
          </div>

          <div>
            <Label className="text-slate-300">Keywords</Label>
            <div className="mt-1.5">
              <KeywordInput
                keywords={formData.keywords}
                onChange={(keywords) => handleChange('keywords', keywords)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Screenshots - Common to all types */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <Label className="text-slate-300">Screenshots / Images</Label>
        
        <div className="flex flex-wrap gap-2">
          {formData.images.map((image, idx) => (
            <div key={idx} className="relative group">
              <img 
                src={image.url} 
                alt={`Screenshot ${idx + 1}`}
                className="w-24 h-24 object-cover rounded-lg border border-slate-700"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(idx)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          
          <label className="w-24 h-24 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-slate-600 transition-colors">
            <input
              ref={fileInputRef}
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
          {journal ? 'Update Entry' : 'Save Entry'}
        </Button>
      </div>
    </form>
  );
}