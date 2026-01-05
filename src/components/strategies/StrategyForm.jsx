import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from "sonner";

export default function StrategyForm({ strategy, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(strategy || {
    name: '',
    description: '',
    guidelines: '',
    images: [],
  });
  const [uploading, setUploading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
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
        images: [...(prev.images || []), ...uploadedImages]
      }));
      toast.success('Images uploaded');
    } catch (error) {
      toast.error('Failed to upload images');
      console.error(error);
    } finally {
      setUploading(false);
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
    if (!formData.name.trim()) {
      toast.error('Strategy name is required');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Strategy Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Opening Range Breakout"
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="What is this strategy about?"
          className="mt-1 h-24"
        />
      </div>

      <div>
        <Label htmlFor="guidelines">Guidelines & Rules</Label>
        <Textarea
          id="guidelines"
          value={formData.guidelines}
          onChange={(e) => handleChange('guidelines', e.target.value)}
          placeholder="How to execute this strategy correctly..."
          className="mt-1 h-32"
        />
      </div>

      <div>
        <Label>Screenshots & Examples</Label>
        <div className="mt-2 space-y-3">
          {formData.images?.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img.url}
                    alt={img.filename}
                    className="w-full h-32 object-cover rounded-lg border border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1 bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div>
            <input
              type="file"
              id="strategy-images"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            <label htmlFor="strategy-images">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                className="w-full"
                onClick={() => document.getElementById('strategy-images').click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Images
                  </>
                )}
              </Button>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || uploading} className="bg-emerald-600 hover:bg-emerald-700">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            strategy ? 'Update Strategy' : 'Create Strategy'
          )}
        </Button>
      </div>
    </form>
  );
}