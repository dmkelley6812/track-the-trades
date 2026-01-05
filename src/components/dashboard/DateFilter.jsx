import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, subDays, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears, isAfter, isBefore, startOfToday, endOfToday, startOfYesterday, endOfYesterday } from 'date-fns';
import { cn } from "@/lib/utils";

const DATE_FILTER_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'current_week', label: 'Current Week (Mon-Fri)' },
  { value: 'past_7_days', label: 'Past 7 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' }
];

export function getDateRange(filterType, customStart, customEnd) {
  const now = new Date();
  
  switch (filterType) {
    case 'today':
      return { start: startOfToday(), end: now };
    
    case 'yesterday':
      return { start: startOfYesterday(), end: endOfYesterday() };
    
    case 'current_week': {
      // ISO week: Monday to Friday
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      let weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 4); // Friday
      weekEnd = endOfDay(weekEnd);
      
      // If today is Saturday (6) or Sunday (0), use last week's Mon-Fri
      const dayOfWeek = now.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() + 4);
        return { start: lastWeekStart, end: endOfDay(lastWeekEnd) };
      }
      
      return { start: weekStart, end: weekEnd };
    }
    
    case 'past_7_days':
      return { start: subDays(now, 7), end: now };
    
    case 'this_month':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    
    case 'last_month': {
      const lastMonth = subMonths(now, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }
    
    case 'this_year':
      return { start: startOfYear(now), end: endOfYear(now) };
    
    case 'last_year': {
      const lastYear = subYears(now, 1);
      return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
    }
    
    case 'custom':
      if (customStart && customEnd) {
        return { start: startOfDay(customStart), end: endOfDay(customEnd) };
      }
      return null;
    
    default:
      return null;
  }
}

export function getDateRangeLabel(filterType, customStart, customEnd) {
  const range = getDateRange(filterType, customStart, customEnd);
  if (!range) return '';
  
  if (filterType === 'custom') {
    return `${format(range.start, 'MMM d')}–${format(range.end, 'MMM d, yyyy')}`;
  }
  
  const option = DATE_FILTER_OPTIONS.find(opt => opt.value === filterType);
  return option?.label || '';
}

export default function DateFilter({ value, onChange }) {
  const [customStart, setCustomStart] = useState(null);
  const [customEnd, setCustomEnd] = useState(null);
  const [showCustom, setShowCustom] = useState(false);

  const handleFilterChange = (newValue) => {
    if (newValue === 'custom') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      onChange(newValue, null, null);
    }
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      if (isAfter(customStart, customEnd)) {
        alert('End date must be after start date');
        return;
      }
      onChange('custom', customStart, customEnd);
      setShowCustom(false);
    }
  };

  const displayLabel = value === 'custom' && customStart && customEnd
    ? getDateRangeLabel('custom', customStart, customEnd)
    : DATE_FILTER_OPTIONS.find(opt => opt.value === value)?.label || 'Select Range';

  return (
    <div className="flex items-center gap-2">
      <CalendarIcon className="w-4 h-4 text-slate-500" />
      <Popover open={showCustom} onOpenChange={setShowCustom}>
        <Select value={value} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[240px] bg-slate-900/50 border-slate-800 text-white">
            <SelectValue>
              <span className="text-sm">{displayLabel}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {DATE_FILTER_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value} className="text-white">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {value === 'custom' && (
          <PopoverContent className="bg-slate-900 border-slate-800 p-4" align="start">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Start Date</label>
                <Calendar
                  mode="single"
                  selected={customStart}
                  onSelect={setCustomStart}
                  className="rounded-md border border-slate-800"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2 block">End Date</label>
                <Calendar
                  mode="single"
                  selected={customEnd}
                  onSelect={setCustomEnd}
                  disabled={(date) => customStart && isBefore(date, customStart)}
                  className="rounded-md border border-slate-800"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCustom(false)}
                  className="flex-1 border-slate-700 text-white hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCustomApply}
                  disabled={!customStart || !customEnd}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}