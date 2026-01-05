import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { 
  Plus, 
  Loader2,
  BookOpen,
  Calendar
} from 'lucide-react';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import JournalForm from '@/components/journal/JournalForm';
import JournalCard from '@/components/journal/JournalCard';

export default function Journal() {
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: journals = [], isLoading: journalsLoading } = useQuery({
    queryKey: ['journals'],
    queryFn: () => base44.entities.Journal.filter({ created_by: user?.email }, '-date'),
    enabled: !!user
  });

  const { data: trades = [] } = useQuery({
    queryKey: ['trades'],
    queryFn: () => base44.entities.Trade.filter({ created_by: user?.email }),
    enabled: !!user
  });

  const createJournalMutation = useMutation({
    mutationFn: (data) => base44.entities.Journal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      setShowJournalForm(false);
    }
  });

  const updateJournalMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Journal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      setShowJournalForm(false);
      setEditingJournal(null);
    }
  });

  // Calculate daily stats for today
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayTrades = trades.filter(t => {
    const tradeDate = format(new Date(t.entry_date), 'yyyy-MM-dd');
    return tradeDate === today && t.status === 'closed';
  });
  const todayStats = {
    pnl: todayTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0),
    count: todayTrades.length
  };

  const handleJournalSubmit = (data) => {
    if (editingJournal) {
      updateJournalMutation.mutate({ id: editingJournal.id, data });
    } else {
      createJournalMutation.mutate(data);
    }
  };

  const handleEditJournal = (journal) => {
    setEditingJournal(journal);
    setShowJournalForm(true);
  };

  // Group journals by month
  const groupedJournals = journals.reduce((acc, journal) => {
    const monthKey = format(new Date(journal.date), 'MMMM yyyy');
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(journal);
    return acc;
  }, {});

  // Check if today has a journal entry
  const todayEntry = journals.find(j => j.date === today);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Trading Journal</h1>
            <p className="text-slate-400 mt-1">Document your trading journey</p>
          </div>
          <Button
            onClick={() => {
              setEditingJournal(null);
              setShowJournalForm(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>

        {/* Today's Quick Card */}
        {!todayEntry && (
          <button
            onClick={() => {
              setEditingJournal(null);
              setShowJournalForm(true);
            }}
            className="w-full mb-8 p-6 bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-2xl text-left hover:border-emerald-500/50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Today</span>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Write today's journal entry
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  {todayStats.count > 0 
                    ? `You made ${todayStats.count} trades today with ${todayStats.pnl >= 0 ? '+' : ''}$${todayStats.pnl.toFixed(2)} P&L`
                    : 'No trades recorded today'
                  }
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                <Plus className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </button>
        )}

        {/* Journal Entries */}
        {journalsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
          </div>
        ) : journals.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 border border-slate-800/50 rounded-2xl">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-medium">No journal entries yet</p>
            <p className="text-slate-500 text-sm mt-1">Start documenting your trading journey</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedJournals).map(([month, entries]) => (
              <div key={month}>
                <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                  {month}
                </h2>
                <div className="space-y-4">
                  {entries.map((journal) => (
                    <JournalCard
                      key={journal.id}
                      journal={journal}
                      onEdit={handleEditJournal}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Journal Form Sheet */}
      <Sheet open={showJournalForm} onOpenChange={setShowJournalForm}>
        <SheetContent className="bg-slate-900 border-slate-800 w-full sm:max-w-lg overflow-y-auto">
          <JournalForm
            journal={editingJournal}
            dailyStats={editingJournal ? null : todayStats}
            onSubmit={handleJournalSubmit}
            onCancel={() => {
              setShowJournalForm(false);
              setEditingJournal(null);
            }}
            isLoading={createJournalMutation.isPending || updateJournalMutation.isPending}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}