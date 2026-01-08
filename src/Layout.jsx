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
import { ThemeProvider } from '@/components/ThemeProvider';

// Theme initialization script - runs before React mounts to avoid FOUC
if (typeof window !== 'undefined') {
  const theme = localStorage.getItem('app-theme') || 'default';
  document.documentElement.setAttribute('data-theme', theme);
}

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
    <ThemeProvider>
      <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--bg))' }}>
        {/* Desktop Sidebar */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r overflow-y-auto" style={{ 
          backgroundColor: 'rgb(var(--bg-elevated) / 0.5)',
          borderColor: 'rgb(var(--border) / 0.5)'
        }}>
          {/* Logo */}
          <div className="flex items-center justify-center px-4 py-6 border-b" style={{
            borderColor: 'rgb(var(--border) / 0.5)'
          }}>
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
                      ? "border" 
                      : ""
                  )}
                  style={isActive ? {
                    backgroundColor: 'rgb(var(--primary) / 0.1)',
                    color: 'rgb(var(--primary))',
                    borderColor: 'rgb(var(--primary-border) / 0.2)'
                  } : {
                    color: 'rgb(var(--text-muted))',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgb(var(--text))';
                      e.currentTarget.style.backgroundColor = 'rgb(var(--hover-bg) / 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgb(var(--text-muted))';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <item.icon className="w-5 h-5" style={isActive ? {
                    color: 'rgb(var(--primary))'
                  } : {}} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="px-3 py-4 border-t" style={{
            borderColor: 'rgb(var(--border) / 0.5)'
          }}>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{
                backgroundColor: 'rgb(var(--border))'
              }}>
                <span className="text-sm font-medium" style={{
                  color: 'rgb(var(--text))'
                }}>
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{
                  color: 'rgb(var(--text))'
                }}>
                  {user?.full_name || 'Trader'}
                </p>
                <p className="text-xs truncate" style={{
                  color: 'rgb(var(--text-muted))'
                }}>{user?.email}</p>
              </div>
              </div>
              <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 px-4 py-3"
              style={{
                color: 'rgb(var(--text-muted))'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgb(var(--danger))';
                e.currentTarget.style.backgroundColor = 'rgb(var(--danger) / 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgb(var(--text-muted))';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              >
              <LogOut className="w-5 h-5" />
              Sign Out
              </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-sm border-b" style={{
        backgroundColor: 'rgb(var(--bg-elevated) / 0.95)',
        borderColor: 'rgb(var(--border) / 0.5)'
      }}>
        <div className="flex items-center justify-between px-4 py-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695be73574dbd3197438974f/3cd5277bb_TRACKTHETRADES.png" 
              alt="Track The Trades" 
              className="h-8"
            />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" style={{
                color: 'rgb(var(--text-muted))'
              }}>
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0" style={{
              backgroundColor: 'rgb(var(--bg-elevated))',
              borderColor: 'rgb(var(--border))'
            }}>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-4 py-4 border-b" style={{
                  borderColor: 'rgb(var(--border))'
                }}>
                  <span className="font-bold" style={{
                    color: 'rgb(var(--text))'
                  }}>Menu</span>
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
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                        style={isActive ? {
                          backgroundColor: 'rgb(var(--primary) / 0.1)',
                          color: 'rgb(var(--primary))'
                        } : {
                          color: 'rgb(var(--text-muted))'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.color = 'rgb(var(--text))';
                            e.currentTarget.style.backgroundColor = 'rgb(var(--hover-bg) / 0.5)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.color = 'rgb(var(--text-muted))';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                        >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
                <div className="px-3 py-4 border-t" style={{
                  borderColor: 'rgb(var(--border))'
                }}>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3"
                    style={{
                      color: 'rgb(var(--text-muted))'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'rgb(var(--danger))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgb(var(--text-muted))';
                    }}
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
    </ThemeProvider>
  );
}