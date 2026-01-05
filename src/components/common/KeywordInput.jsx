import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';

export default function KeywordInput({ keywords = [], onChange }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newKeyword = inputValue.trim();
      if (!keywords.includes(newKeyword)) {
        onChange([...keywords, newKeyword]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && keywords.length > 0) {
      onChange(keywords.slice(0, -1));
    }
  };

  const removeKeyword = (index) => {
    onChange(keywords.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, idx) => (
          <Badge
            key={idx}
            variant="secondary"
            className="bg-slate-700 text-slate-200 pl-2 pr-1"
          >
            {keyword}
            <button
              type="button"
              onClick={() => removeKeyword(idx)}
              className="ml-1 hover:bg-slate-600 rounded p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type and press Enter to add keywords..."
        className="bg-slate-800 border-slate-700 text-white"
      />
      <p className="text-xs text-slate-500">
        Press Enter to add, Backspace to remove last
      </p>
    </div>
  );
}