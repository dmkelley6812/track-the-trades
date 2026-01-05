import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  BarChart2, 
  Upload, 
  PenLine, 
  Target,
  CheckCircle,
  Rocket
} from 'lucide-react';

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Track The Trades',
    subtitle: 'Your personal trading journal and performance tracker',
    icon: Rocket
  },
  {
    id: 'goals',
    title: 'Set Your Trading Goals',
    subtitle: 'Define what success looks like for you',
    icon: Target
  },
  {
    id: 'method',
    title: 'How will you add trades?',
    subtitle: 'Choose your preferred method',
    icon: PenLine
  }
];

export default function OnboardingFlow({ onComplete, user }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [goals, setGoals] = useState({
    daily_profit_target: '',
    max_daily_loss: '',
    account_size: ''
  });
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete({
      trading_goals: {
        daily_profit_target: goals.daily_profit_target ? parseFloat(goals.daily_profit_target) : null,
        max_daily_loss: goals.max_daily_loss ? parseFloat(goals.max_daily_loss) : null
      },
      default_account_size: goals.account_size ? parseFloat(goals.account_size) : null,
      onboarding_completed: true,
      preferred_method: selectedMethod
    });
  };

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <BarChart2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-3">
                Track The Trades
              </h1>
              <p className="text-slate-400 max-w-md mx-auto">
                Track your day trading performance, analyze your wins and losses, 
                and become a better trader with data-driven insights.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { icon: BarChart2, label: 'Track P&L' },
                { icon: Upload, label: 'Import CSV' },
                { icon: PenLine, label: 'Journal' }
              ].map((feature, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <feature.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">{feature.label}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white">Set Your Goals</h2>
              <p className="text-slate-400 mt-2">Optional, but helps track your progress</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-1.5 block">Account Size ($)</label>
                <Input
                  type="number"
                  value={goals.account_size}
                  onChange={(e) => setGoals(prev => ({ ...prev, account_size: e.target.value }))}
                  placeholder="25000"
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1.5 block">Daily Profit Target ($)</label>
                <Input
                  type="number"
                  value={goals.daily_profit_target}
                  onChange={(e) => setGoals(prev => ({ ...prev, daily_profit_target: e.target.value }))}
                  placeholder="500"
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1.5 block">Max Daily Loss ($)</label>
                <Input
                  type="number"
                  value={goals.max_daily_loss}
                  onChange={(e) => setGoals(prev => ({ ...prev, max_daily_loss: e.target.value }))}
                  placeholder="200"
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
        );

      case 'method':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <PenLine className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white">How will you add trades?</h2>
              <p className="text-slate-400 mt-2">You can change this anytime</p>
            </div>
            <div className="space-y-3">
              {[
                { id: 'manual', icon: PenLine, title: 'Manual Entry', desc: 'Enter trades one by one' },
                { id: 'csv', icon: Upload, title: 'Import CSV', desc: 'Upload from TradingView or TradeStation' },
                { id: 'both', icon: CheckCircle, title: 'Both', desc: 'Mix of manual and imports' }
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left",
                    selectedMethod === method.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-700 hover:border-slate-600 bg-slate-800/30"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    selectedMethod === method.id ? "bg-emerald-500/20" : "bg-slate-800"
                  )}>
                    <method.icon className={cn(
                      "w-6 h-6",
                      selectedMethod === method.id ? "text-emerald-400" : "text-slate-400"
                    )} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{method.title}</p>
                    <p className="text-sm text-slate-400">{method.desc}</p>
                  </div>
                  {selectedMethod === method.id && (
                    <CheckCircle className="w-5 h-5 text-emerald-400 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1 flex-1 rounded-full transition-all",
                idx <= currentStep ? "bg-emerald-500" : "bg-slate-800"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8"
          >
            {renderStepContent()}

            {/* Navigation */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-800">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              {currentStep < STEPS.length - 1 ? (
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!selectedMethod}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Get Started
                  <Rocket className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}