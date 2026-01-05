import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Crown, 
  UserCheck, 
  Activity, 
  Upload, 
  TrendingUp,
  Loader2,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import StatsCard from '@/components/dashboard/StatsCard';

export default function Admin() {
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    enabled: currentUser?.role === 'admin'
  });

  const { data: trades = [], isLoading: tradesLoading } = useQuery({
    queryKey: ['allTrades'],
    queryFn: () => base44.entities.Trade.list(),
    enabled: currentUser?.role === 'admin'
  });

  const { data: importLogs = [] } = useQuery({
    queryKey: ['importLogs'],
    queryFn: () => base44.entities.ImportLog.list('-created_date', 20),
    enabled: currentUser?.role === 'admin'
  });

  if (userLoading || usersLoading || tradesLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-slate-400">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const freeUsers = users.filter(u => u.subscription_tier !== 'pro').length;
  const proUsers = users.filter(u => u.subscription_tier === 'pro').length;
  const totalTrades = trades.length;
  const manualTrades = trades.filter(t => t.source === 'manual').length;
  const importedTrades = trades.filter(t => t.source?.includes('csv') || t.source?.includes('api')).length;

  // Recent users
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Monitor user activity and app statistics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatsCard title="Total Users" value={users.length} icon={Users} />
          <StatsCard title="Free Users" value={freeUsers} icon={UserCheck} />
          <StatsCard title="Pro Users" value={proUsers} icon={Crown} />
          <StatsCard title="Total Trades" value={totalTrades} icon={Activity} />
          <StatsCard title="Manual Trades" value={manualTrades} icon={TrendingUp} />
          <StatsCard title="Imported" value={importedTrades} icon={Upload} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-400" />
                Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name || 'Unknown'}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={cn(
                        "text-xs",
                        user.subscription_tier === 'pro' 
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/50" 
                          : "bg-slate-700 text-slate-400"
                      )}>
                        {user.subscription_tier === 'pro' ? 'Pro' : 'Free'}
                      </Badge>
                      <p className="text-xs text-slate-500 mt-1">
                        {format(new Date(user.created_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Imports */}
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-slate-400" />
                Recent Imports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {importLogs.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No imports yet</p>
              ) : (
                <div className="space-y-3">
                  {importLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium capitalize">
                            {log.source?.replace(/_/g, ' ')}
                          </p>
                          <Badge className={cn(
                            "text-xs",
                            log.status === 'success' 
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" 
                              : log.status === 'partial'
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                              : "bg-red-500/20 text-red-400 border-red-500/50"
                          )}>
                            {log.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          {log.trades_imported} imported
                          {log.trades_failed > 0 && `, ${log.trades_failed} failed`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">
                          {format(new Date(log.created_date), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Subscription Breakdown */}
        <Card className="bg-slate-900/50 border-slate-800/50 mt-6">
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="flex-1">
                <div className="h-4 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    style={{ width: `${users.length > 0 ? (freeUsers / users.length) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-slate-400">Free: {freeUsers}</span>
                  <span className="text-amber-400">Pro: {proUsers}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-400">
                  {users.length > 0 ? ((proUsers / users.length) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-sm text-slate-400">Pro conversion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}