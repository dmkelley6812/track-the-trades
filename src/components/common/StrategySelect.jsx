import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from 'lucide-react';
import StrategyForm from '@/components/strategies/StrategyForm';
import { toast } from "sonner";

export default function StrategySelect({ value, onChange }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: strategies, isLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.Strategy.list(),
  });

  const createStrategyMutation = useMutation({
    mutationFn: (data) => base44.entities.Strategy.create(data),
    onSuccess: (newStrategy) => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      onChange(newStrategy.id);
      setShowCreateDialog(false);
      toast.success('Strategy created');
    },
    onError: () => {
      toast.error('Failed to create strategy');
    }
  });

  const handleCreateStrategy = (data) => {
    createStrategyMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900">
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        <span className="text-sm text-slate-400">Loading strategies...</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select strategy..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>None</SelectItem>
            {strategies?.map((strategy) => (
              <SelectItem key={strategy.id} value={strategy.id}>
                {strategy.name}
                {strategy.is_system_strategy && ' (System)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowCreateDialog(true)}
          className="shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Strategy</DialogTitle>
          </DialogHeader>
          <StrategyForm
            onSubmit={handleCreateStrategy}
            onCancel={() => setShowCreateDialog(false)}
            isLoading={createStrategyMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}