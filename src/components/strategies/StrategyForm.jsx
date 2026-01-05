import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from "sonner";

export default function StrategyForm({ strategy, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: strategy?.name || '',
    description: strategy?.description || '',
    guidelines: strategy?.guidelines || '',
    images: strategy?.images || [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({
        ...formData,
        images: [...formData.images, {
          url: file_url,
          filename: file.name,
          uploadedAt: new Date().toISOString(),
        }],
      });
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error(error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Strategy name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      let savedStrategy;
      if (strategy?.id) {
        savedStrategy = await base44.entities.Strategy.update(strategy.id, formData);
      } else {
        savedStrategy = await base44.entities.Strategy.create(formData);
      }
      toast.success(strategy?.id ? 'Strategy updated' : 'Strategy created');
      onSave(savedStrategy);
    } catch (error) {
      toast.error('Failed to save strategy');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-slate-300">Strategy Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Momentum Breakout"
          className="bg-slate-800 border-slate-700 text-white mt-1"
          required
        />
      </div>

      <div>
        <Label className="text-slate-300">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief overview of this strategy..."
          className="bg-slate-800 border-slate-700 text-white mt-1 h-20"
        />
      </div>

      <div>
        <Label className="text-slate-300">Guidelines & Rules</Label>
        <Textarea
          value={formData.guidelines}
          onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
          placeholder="How to execute this strategy correctly..."
          className="bg-slate-800 border-slate-700 text-white mt-1 h-32"
        />
      </div>

      <div>
        <Label className="text-slate-300">Images</Label>
        <div className="mt-2 space-y-2">
          {formData.images.map((image, idx) => (
            <div key={idx} className="relative group">
              <img
                src={image.url}
                alt={image.filename}
                className="w-full h-40 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('strategy-image-upload')?.click()}
            disabled={isUploadingImage}
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            {isUploadingImage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Add Image
              </>
            )}
          </Button>
          <input
            id="strategy-image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
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
          disabled={isSubmitting}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            strategy?.id ? 'Update Strategy' : 'Create Strategy'
          )}
        </Button>
      </div>
    </form>
  );
}