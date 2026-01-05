import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, Loader2, ImagePlus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const MOOD_OPTIONS = [
  { value: 'confident', label: '😎 Confident', color: 'text-emerald-400' },
  { value: 'focused', label: '🎯 Focused', color: 'text-blue-400' },
  { value: 'neutral', label: '😐 Neutral', color: 'text-slate-400' },
  { value: 'anxious', label: '😰 Anxious', color: 'text-amber-400' },
  { value: 'frustrated', label: '😤 Frustrated', color: 'text-red-400' }
];

export default function JournalForm({ journal, onSubmit, onCancel, isLoading, dailyStats }) {
  const [formData, setFormData] = useState({
    date: journal?.date || format(new Date(), 'yyyy-MM-dd'),
    title: journal?.title || '',
    content: journal?.content || '',
    mood: journal?.mood || 'neutral',
    market_conditions: journal?.market_conditions || '',
    lessons_learned: journal?.lessons_learned || '',
    goals_for_tomorrow: journal?.goals_for_tomorrow || '',
    daily_pnl: journal?.daily_pnl ?? dailyStats?.pnl ?? '',
    trades_count: journal?.trades_count ?? dailyStats?.count ?? '',
    images: journal?.images || []
  });

  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSize = 10 * 1024 * 1024;

    const invalidFiles = files.filter(f => !validTypes.includes(f.type) || f.size > maxSize);
    if (invalidFiles.length > 0) {
      toast.error('Some files were invalid. Use PNG, JPG, or WEBP under 10MB.');
      return;
    }

    setUploadingImages(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return {
          url: file_url,
          filename: file.name,
          uploadedAt: new Date().toISOString()
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages]
      }));
      toast.success(`${uploadedImages.length} image(s) uploaded`);
    } catch (err) {
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      daily_pnl: formData.daily_pnl ? parseFloat(formData.daily_pnl) : null,
      trades_count: formData.trades_count ? parseInt(formData.trades_count) : null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <h2 className="text-xl font-semibold text-white">
          {journal ? 'Edit Journal Entry' : 'New Journal Entry'}
        </h2>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-300">Date</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
          <div>
            <Label className="text-slate-300">Mood</Label>
            <Select value={formData.mood} onValueChange={(v) => handleChange('mood', v)}>
              <SelectTrigger className="mt-1.5 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {MOOD_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="text-white">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-slate-300">Title (optional)</Label>
          <Input
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., Great momentum day, Learned about patience..."
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>

        <div>
          <Label className="text-slate-300">Daily Reflection</Label>
          <Textarea
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="How did the day go? What trades did you take? What was your mindset?"
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[120px]"
          />
        </div>

        <div>
          <Label className="text-slate-300">Market Conditions</Label>
          <Textarea
            value={formData.market_conditions}
            onChange={(e) => handleChange('market_conditions', e.target.value)}
            placeholder="How was the overall market? Any notable news or events?"
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[80px]"
          />
        </div>

        <div>
          <Label className="text-slate-300">Lessons Learned</Label>
          <Textarea
            value={formData.lessons_learned}
            onChange={(e) => handleChange('lessons_learned', e.target.value)}
            placeholder="What did you learn today? Any mistakes to avoid?"
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[80px]"
          />
        </div>

        <div>
          <Label className="text-slate-300">Goals for Tomorrow</Label>
          <Textarea
            value={formData.goals_for_tomorrow}
            onChange={(e) => handleChange('goals_for_tomorrow', e.target.value)}
            placeholder="What will you focus on tomorrow? Any setups you're watching?"
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-300">Daily P&L ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.daily_pnl}
              onChange={(e) => handleChange('daily_pnl', e.target.value)}
              placeholder="0.00"
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <div>
            <Label className="text-slate-300">Trades Taken</Label>
            <Input
              type="number"
              value={formData.trades_count}
              onChange={(e) => handleChange('trades_count', e.target.value)}
              placeholder="0"
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="pt-4 border-t border-slate-800">
          <Label className="text-slate-300 mb-3 block">Images / Screenshots</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImages}
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            {uploadingImages ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ImagePlus className="w-4 h-4 mr-2" />
                Add Images
              </>
            )}
          </Button>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {formData.images.map((image, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-800">
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1.5 bg-red-500/90 hover:bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                  {idx === 0 && (
                    <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-emerald-500/90 text-white text-xs rounded">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
          {journal ? 'Update Entry' : 'Save Entry'}
        </Button>
      </div>
    </form>
  );
}