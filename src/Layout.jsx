import { useState, useEffect } from 'react';
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

// Palette initialization - handled by PaletteManager

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
      <div className="min-h-screen bg-[rgb(var(--bg))]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r border-[rgb(var(--border))] overflow-y-auto bg-[rgb(var(--bg-elevated))]">
          {/* Logo */}
          <div className="flex items-center justify-center px-4 py-6 border-b border-[rgb(var(--border))]">
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
                      ? "bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] border border-[rgb(var(--primary-border))]" 
                      : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--hover-bg))]"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "text-[rgb(var(--primary))]")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="px-3 py-4 border-t border-[rgb(var(--border))]">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[rgb(var(--border))]">
                <span className="text-sm font-medium text-[rgb(var(--text))]">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-[rgb(var(--text))]">
                  {user?.full_name || 'Trader'}
                </p>
                <p className="text-xs truncate text-[rgb(var(--text-muted))]">{user?.email}</p>
              </div>
              </div>
              <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 px-4 py-3 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--danger))] hover:bg-[rgb(var(--danger)/0.1)]"
              >
              <LogOut className="w-5 h-5" />
              Sign Out
              </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-sm border-b bg-[rgb(var(--bg-elevated))] border-[rgb(var(--border))]">
        <div className="flex items-center justify-between px-4 py-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695be73574dbd3197438974f/3cd5277bb_TRACKTHETRADES.png" 
              alt="Track The Trades" 
              className="h-8"
            />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-[rgb(var(--text-muted))]">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0 bg-[rgb(var(--bg-elevated))] border-[rgb(var(--border))]">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-4 py-4 border-b border-[rgb(var(--border))]">
                  <span className="font-bold text-[rgb(var(--text))]">Menu</span>
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
                            ? "bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]" 
                            : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--hover-bg))]"
                        )}
                        >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
                <div className="px-3 py-4 border-t border-[rgb(var(--border))]">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--danger))]"
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