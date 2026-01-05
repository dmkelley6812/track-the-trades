import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { X } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function KeywordInput({ keywords = [], onChange, placeholder = "Add keywords..." }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const keyword = inputValue.trim();
      if (keyword && !keywords.includes(keyword)) {
        onChange([...keywords, keyword]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && inputValue === '' && keywords.length > 0) {
      onChange(keywords.slice(0, -1));
    }
  };

  const removeKeyword = (index) => {
    onChange(keywords.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 min-h-[42px] rounded-lg border border-slate-700 bg-slate-900">
      {keywords.map((keyword, index) => (
        <div
          key={index}
          className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-sm border border-emerald-500/30"
        >
          <span>{keyword}</span>
          <button
            type="button"
            onClick={() => removeKeyword(index)}
            className="hover:text-emerald-100 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={keywords.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
      />
    </div>
  );
}