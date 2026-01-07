import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import StrategyForm from '@/components/strategies/StrategyForm';
import StrategyDetailView from '@/components/strategies/StrategyDetailView';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function StrategiesPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [viewingStrategy, setViewingStrategy] = useState(null);
  const [deletingStrategy, setDeletingStrategy] = useState(null);

  const queryClient = useQueryClient();

  const { data: strategies = [], isLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.Strategy.list()
  });

  const { data: allTrades = [] } = useQuery({
    queryKey: ['trades'],
    queryFn: () => base44.entities.Trade.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Strategy.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      setShowCreateDialog(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Strategy.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      setEditingStrategy(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Strategy.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      setDeletingStrategy(null);
    }
  });

  const userStrategies = strategies.filter(s => !s.is_system_strategy);
  const systemStrategies = strategies.filter(s => s.is_system_strategy);

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Strategies</h1>
            <p className="text-slate-400 mt-1">Define and manage your trading strategies</p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Strategy
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : (
          <>
            {/* User Strategies */}
            {userStrategies.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">My Strategies</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {userStrategies.map((strategy) => (
                    <Card
                      key={strategy.id}
                      className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                      onClick={() => setViewingStrategy(strategy)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-white text-lg">{strategy.name}</CardTitle>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-white"
                              onClick={() => setEditingStrategy(strategy)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-red-400"
                              onClick={() => setDeletingStrategy(strategy)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                          {strategy.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {strategy.images?.length > 0 && (
                            <div className="flex items-center gap-1">
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>{strategy.images.length}</span>
                            </div>
                          )}
                          {strategy.guidelines && (
                            <div className="flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" />
                              <span>Guidelines</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* System Strategies */}
            {systemStrategies.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Default Strategies</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {systemStrategies.map((strategy) => (
                    <Card
                      key={strategy.id}
                      className="bg-slate-900/30 border-slate-800/50 hover:border-slate-700/50 transition-all cursor-pointer"
                      onClick={() => setViewingStrategy(strategy)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white text-lg">{strategy.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {strategy.description || 'No description'}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {userStrategies.length === 0 && systemStrategies.length === 0 && (
              <Card className="bg-slate-900/30 border-slate-800 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-slate-600 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No strategies yet</h3>
                  <p className="text-sm text-slate-400 text-center mb-4">
                    Create your first trading strategy to get started
                  </p>
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Strategy
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <StrategyForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setShowCreateDialog(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingStrategy} onOpenChange={() => setEditingStrategy(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <StrategyForm
            strategy={editingStrategy}
            onSubmit={(data) => updateMutation.mutate({ id: editingStrategy.id, data })}
            onCancel={() => setEditingStrategy(null)}
            isLoading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {viewingStrategy && (
        <StrategyDetailView
          strategy={viewingStrategy}
          trades={allTrades}
          open={!!viewingStrategy}
          onOpenChange={() => setViewingStrategy(null)}
          onClose={() => setViewingStrategy(null)}
          onEdit={(strategy) => {
            setViewingStrategy(null);
            setEditingStrategy(strategy);
          }}
          onDelete={(strategy) => {
            setViewingStrategy(null);
            setDeletingStrategy(strategy);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingStrategy} onOpenChange={() => setDeletingStrategy(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Strategy?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete "{deletingStrategy?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deletingStrategy.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}