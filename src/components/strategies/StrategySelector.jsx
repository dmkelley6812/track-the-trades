import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import StrategyForm from './StrategyForm';

export default function StrategySelector({ value, onChange }) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: strategies = [], refetch } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.Strategy.list('-created_date'),
  });

  const handleStrategyCreated = (newStrategy) => {
    refetch();
    onChange(newStrategy.id);
    setShowCreateForm(false);
  };

  return (
    <>
      <div className="flex gap-2">
        <Select value={value || ''} onValueChange={(val) => onChange(val || null)}>
          <SelectTrigger className="flex-1 bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Select strategy (optional)" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value={null}>No strategy</SelectItem>
            {strategies.map((strategy) => (
              <SelectItem key={strategy.id} value={strategy.id}>
                {strategy.name}
                {strategy.is_system_strategy && (
                  <span className="ml-2 text-xs text-slate-500">• System</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowCreateForm(true)}
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Sheet open={showCreateForm} onOpenChange={setShowCreateForm}>
        <SheetContent side="right" className="bg-slate-900 border-slate-800 text-white w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-white">Create New Strategy</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <StrategyForm
              onSave={handleStrategyCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}