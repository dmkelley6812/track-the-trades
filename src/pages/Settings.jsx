import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Target, 
  Palette, 
  CreditCard,
  Save,
  Loader2,
  Crown,
  Check
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTheme } from '@/components/ThemeProvider';

const COLOR_THEMES = [
  {
    value: 'default',
    label: 'Default',
    description: 'Original dark theme with emerald accents',
    colors: ['#10b981', '#a855f7', '#1e293b', '#334155']
  },
  {
    value: 'colorful',
    label: 'Colorful',
    description: 'Vibrant emerald and purple accents',
    colors: ['#10b981', '#a855f7', '#3b82f6', '#fbbf24']
  },
  {
    value: 'high-contrast',
    label: 'High Contrast',
    description: 'Maximum readability with bold colors',
    colors: ['#00ffff', '#ffff00', '#ff3232', '#00ff64']
  },
  {
    value: 'light',
    label: 'Light Mode',
    description: 'Clean light theme with blue accents',
    colors: ['#6366f1', '#8b5cf6', '#3b82f6', '#f59e0b']
  },
  {
    value: 'monochrome',
    label: 'Monochrome',
    description: 'Minimal grayscale aesthetic',
    colors: ['#d4d4d4', '#f5f5f5', '#b4b4b4', '#a3a3a3']
  }
];

export default function Settings() {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const [settings, setSettings] = useState(null);

  // Initialize settings from user data
  useState(() => {
    if (user) {
      setSettings({
        theme_preference: user.theme_preference || 'dark',
        default_account_size: user.default_account_size || '',
        timezone: user.timezone || 'America/New_York',
        trading_goals: {
          daily_profit_target: user.trading_goals?.daily_profit_target || '',
          max_daily_loss: user.trading_goals?.max_daily_loss || '',
          weekly_trade_limit: user.trading_goals?.weekly_trade_limit || ''
        }
      });
    }
  });

  // Update settings when user data loads
  if (user && !settings) {
    setSettings({
      theme_preference: user.theme_preference || 'dark',
      default_account_size: user.default_account_size || '',
      timezone: user.timezone || 'America/New_York',
      trading_goals: {
        daily_profit_target: user.trading_goals?.daily_profit_target || '',
        max_daily_loss: user.trading_goals?.max_daily_loss || '',
        weekly_trade_limit: user.trading_goals?.weekly_trade_limit || ''
      }
    });
  }

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Settings saved successfully');
    }
  });

  const handleSave = () => {
    if (!settings) return;
    
    updateUserMutation.mutate({
      theme_preference: settings.theme_preference,
      default_account_size: settings.default_account_size ? parseFloat(settings.default_account_size) : null,
      timezone: settings.timezone,
      trading_goals: {
        daily_profit_target: settings.trading_goals.daily_profit_target ? parseFloat(settings.trading_goals.daily_profit_target) : null,
        max_daily_loss: settings.trading_goals.max_daily_loss ? parseFloat(settings.trading_goals.max_daily_loss) : null,
        weekly_trade_limit: settings.trading_goals.weekly_trade_limit ? parseInt(settings.trading_goals.weekly_trade_limit) : null
      }
    });
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleGoalChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      trading_goals: { ...prev.trading_goals, [field]: value }
    }));
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const isPro = user?.subscription_tier === 'pro';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-slate-400 mt-1">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Account Info */}
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-800">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <CardTitle>Account</CardTitle>
                  <CardDescription className="text-slate-500">Your account information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user?.full_name || 'Trader'}</p>
                  <p className="text-sm text-slate-400">{user?.email}</p>
                </div>
                <Badge className={cn(
                  "text-xs",
                  isPro ? "bg-amber-500/20 text-amber-400 border-amber-500/50" : "bg-slate-700 text-slate-400"
                )}>
                  {isPro ? (
                    <>
                      <Crown className="w-3 h-3 mr-1" />
                      Pro
                    </>
                  ) : 'Free'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Trading Goals */}
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Target className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <CardTitle>Trading Goals</CardTitle>
                  <CardDescription className="text-slate-500">Set your daily and weekly targets</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Account Size ($)</Label>
                  <Input
                    type="number"
                    value={settings.default_account_size}
                    onChange={(e) => handleChange('default_account_size', e.target.value)}
                    placeholder="25000"
                    className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Daily Profit Target ($)</Label>
                  <Input
                    type="number"
                    value={settings.trading_goals.daily_profit_target}
                    onChange={(e) => handleGoalChange('daily_profit_target', e.target.value)}
                    placeholder="500"
                    className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Max Daily Loss ($)</Label>
                  <Input
                    type="number"
                    value={settings.trading_goals.max_daily_loss}
                    onChange={(e) => handleGoalChange('max_daily_loss', e.target.value)}
                    placeholder="200"
                    className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Weekly Trade Limit</Label>
                  <Input
                    type="number"
                    value={settings.trading_goals.weekly_trade_limit}
                    onChange={(e) => handleGoalChange('weekly_trade_limit', e.target.value)}
                    placeholder="25"
                    className="mt-1.5 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Palette className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription className="text-slate-500">
                    Choose your color theme (changes apply immediately)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Debug Info - Always visible for now to verify theme system */}
              <div className="text-xs font-mono bg-slate-800/50 p-3 rounded space-y-1">
                <div className="text-slate-400">🔍 Theme Debug Info:</div>
                <div className="text-emerald-400">Context: {theme}</div>
                <div className="text-emerald-400">
                  localStorage: {typeof window !== 'undefined' ? localStorage.getItem('app-theme') || 'null' : 'N/A'}
                </div>
                <div className="text-emerald-400">
                  DOM attribute: {typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') || 'null' : 'N/A'}
                </div>
              </div>
              
              {/* Color Theme Selector */}
              <div>
                <Label className="text-slate-300 mb-3 block">Color Theme</Label>
                <RadioGroup value={theme} onValueChange={setTheme} className="space-y-3">
                  {COLOR_THEMES.map((colorTheme) => (
                    <label
                      key={colorTheme.value}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                        theme === colorTheme.value
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                      )}
                    >
                      <RadioGroupItem value={colorTheme.value} className="border-slate-600" />
                      <div className="flex-1">
                        <div className="font-medium text-white mb-1">{colorTheme.label}</div>
                        <div className="text-sm text-slate-400">{colorTheme.description}</div>
                      </div>
                      <div className="flex gap-1.5">
                        {colorTheme.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 rounded-md border border-slate-600"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <Separator className="bg-slate-800" />

              {/* Timezone */}
              <div>
                <Label className="text-slate-300">Timezone</Label>
                <Select 
                  value={settings.timezone} 
                  onValueChange={(v) => handleChange('timezone', v)}
                >
                  <SelectTrigger className="mt-1.5 bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="America/New_York" className="text-white">Eastern (ET)</SelectItem>
                    <SelectItem value="America/Chicago" className="text-white">Central (CT)</SelectItem>
                    <SelectItem value="America/Denver" className="text-white">Mountain (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles" className="text-white">Pacific (PT)</SelectItem>
                    <SelectItem value="UTC" className="text-white">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card className="bg-slate-900/50 border-slate-800/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <CardTitle>Subscription</CardTitle>
                  <CardDescription className="text-slate-500">Manage your plan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isPro ? (
                <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold text-amber-400">Pro Plan Active</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    You have access to all premium features including advanced analytics, 
                    unlimited trade imports, and priority support.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <h4 className="font-semibold mb-3">Upgrade to Pro</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                      {[
                        'Unlimited CSV imports',
                        'Advanced analytics & insights',
                        'API sync with TradingView & TradeStation',
                        'Export reports',
                        'Priority support'
                      ].map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Pro - $19/month
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={updateUserMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {updateUserMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}