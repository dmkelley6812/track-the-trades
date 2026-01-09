import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from './utils';
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  LineChart, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Shield,
  Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ExpectancyLogo from '@/components/common/ExpectancyLogo';
import '@/components/common/palette'; // Initialize palette on app load

const NAV_ITEMS = [
  { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard },
  { name: 'Trades', page: 'Trades', icon: LineChart },
  { name: 'Journal', page: 'Journal', icon: BookOpen },
  { name: 'Strategies', page: 'Strategies', icon: BookOpen },
  { name: 'Analytics', page: 'Analytics', icon: BarChart3 },
  { name: 'Insights', page: 'Insights', icon: Sparkles },
  { name: 'Settings', page: 'Settings', icon: Settings },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const handleLogout = () => {
    base44.auth.logout();
  };

  // Don't show layout on onboarding
  if (currentPageName === 'Dashboard' && user && !user.onboarding_completed) {
    return <>{children}</>;
  }

  const navItems = user?.role === 'admin' 
    ? [...NAV_ITEMS, { name: 'Admin', page: 'Admin', icon: Shield }]
    : NAV_ITEMS;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-card/50 border-r border-border overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-center px-4 py-6 border-b border-border">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695be73574dbd3197438974f/3cd5277bb_TRACKTHETRADES.png" 
              alt="Track The Trades" 
              className="w-full max-w-[220px]"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="px-3 py-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                <span className="text-sm font-medium text-foreground">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.full_name || 'Trader'}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 px-4 py-3 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
              >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695be73574dbd3197438974f/3cd5277bb_TRACKTHETRADES.png" 
              alt="Track The Trades" 
              className="h-8"
            />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-card border-border p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                  <span className="font-bold text-foreground">Menu</span>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-1">
                  {navItems.map((item) => {
                    const isActive = currentPageName === item.page;
                    return (
                      <Link
                        key={item.page}
                        to={createPageUrl(item.page)}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                          isActive 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
                <div className="px-3 py-4 border-t border-border">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-red-400"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-64 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}