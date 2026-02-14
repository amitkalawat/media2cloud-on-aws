import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ErrorBoundary } from './ErrorBoundary';
import { cn } from '@/lib/utils';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          isMobile
            ? 'fixed inset-y-0 left-0 z-50 transition-transform duration-200'
            : 'relative',
          isMobile && !mobileOpen && '-translate-x-full'
        )}
      >
        <Sidebar
          collapsed={isMobile ? false : collapsed}
          onToggle={() => {
            if (isMobile) setMobileOpen(false);
            else setCollapsed(!collapsed);
          }}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar with hamburger on mobile */}
        <header className="flex h-16 items-center border-b border-border bg-surface px-4 md:px-0">
          {isMobile && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mr-3 rounded-lg p-2 text-text-secondary hover:bg-accent-light/50 md:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
          <div className="flex-1">
            <Topbar />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
