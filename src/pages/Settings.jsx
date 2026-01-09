import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  User, 
  Target, 
  Palette, 
  Bell, 
  Shield, 
  CreditCard,
  Save,
  Loader2,
  Crown,
  Check
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PALETTES, setPalette, getInitialPalette } from '@/components/common/palette';

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const [settings, setSettings] = useState(null);

  // Initialize settings from user data
  useState(() => {
    if (user) {
      setSettings({
        color_palette: user.color_palette || getInitialPalette(),
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
      color_palette: user.color_palette || getInitialPalette(),
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
      color_palette: settings.color_palette,
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
    
    // Apply palette immediately on change
    if (field === 'color_palette') {
      setPalette(value);
    }
  };

  const handleGoalChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      trading_goals: { ...prev.trading_goals, [field]: value }
    }));
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPro = user?.subscription_tier === 'pro';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
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
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription className="text-muted-foreground">Choose your color palette</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Color Palette</Label>
                <RadioGroup
                  value={settings.color_palette}
                  onValueChange={(value) => handleChange('color_palette', value)}
                  className="space-y-3"
                >
                  {PALETTES.map((palette) => (
                    <label
                      key={palette.id}
                      htmlFor={`palette-${palette.id}`}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary",
                        settings.color_palette === palette.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card"
                      )}
                    >
                      <RadioGroupItem
                        value={palette.id}
                        id={`palette-${palette.id}`}
                        className="flex-shrink-0"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex gap-1.5">
                          <div
                            className="w-5 h-5 rounded-full border border-border"
                            style={{ backgroundColor: palette.preview.background }}
                          />
                          <div
                            className="w-5 h-5 rounded-full border border-border"
                            style={{ backgroundColor: palette.preview.primary }}
                          />
                          <div
                            className="w-5 h-5 rounded-full border border-border"
                            style={{ backgroundColor: palette.preview.accent }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{palette.label}</p>
                          <p className="text-xs text-muted-foreground">{palette.description}</p>
                        </div>
                      </div>
                      {settings.color_palette === palette.id && (
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <Separator />
              <div>
                <Label>Timezone</Label>
                <Select 
                  value={settings.timezone} 
                  onValueChange={(v) => handleChange('timezone', v)}
                >
                  <SelectTrigger className="mt-1.5 bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
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