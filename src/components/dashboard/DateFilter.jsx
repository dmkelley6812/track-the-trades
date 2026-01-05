import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, subDays, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears, isAfter, isBefore, startOfToday, endOfToday, startOfYesterday, endOfYesterday } from 'date-fns';
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

export default function DateFilter({ value, onChange, customStart, customEnd, onCustomDatesChange }) {
  const [startPickerOpen, setStartPickerOpen] = useState(false);
  const [endPickerOpen, setEndPickerOpen] = useState(false);

  // Set defaults when switching to custom
  useEffect(() => {
    if (value === 'custom' && !customStart && !customEnd) {
      const defaultStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday of current week
      const defaultEnd = endOfToday();
      onCustomDatesChange(defaultStart, defaultEnd);
    }
  }, [value, customStart, customEnd, onCustomDatesChange]);

  const handleFilterChange = (newValue) => {
    if (newValue !== 'custom') {
      onChange(newValue, null, null);
    } else {
      onChange(newValue, customStart, customEnd);
    }
  };

  const handleStartDateChange = (date) => {
    if (date) {
      // If new start date is after current end date, set end date to start date
      const newEnd = customEnd && isAfter(date, customEnd) ? date : customEnd;
      onCustomDatesChange(date, newEnd);
      setStartPickerOpen(false);
    }
  };

  const handleEndDateChange = (date) => {
    if (date) {
      onCustomDatesChange(customStart, date);
      setEndPickerOpen(false);
    }
  };

  const displayLabel = value === 'custom' && customStart && customEnd
    ? getDateRangeLabel('custom', customStart, customEnd)
    : DATE_FILTER_OPTIONS.find(opt => opt.value === value)?.label || 'Select Range';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CalendarIcon className="w-4 h-4 text-slate-500" />
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
      </div>
      
      {value === 'custom' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Start Date</label>
              <Popover open={startPickerOpen} onOpenChange={setStartPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStart ? format(customStart, 'MMM d, yyyy') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-800" align="start">
                  <Calendar
                    mode="single"
                    selected={customStart}
                    onSelect={handleStartDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="text-xs text-slate-400 mb-2 block">End Date</label>
              <Popover open={endPickerOpen} onOpenChange={setEndPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEnd ? format(customEnd, 'MMM d, yyyy') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-800" align="start">
                  <Calendar
                    mode="single"
                    selected={customEnd}
                    onSelect={handleEndDateChange}
                    disabled={(date) => customStart && isBefore(date, customStart)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}