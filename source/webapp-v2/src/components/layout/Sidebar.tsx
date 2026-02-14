import { NavLink, useLocation } from 'react-router-dom';
import {
  Library,
  Upload,
  Loader,
  BarChart3,
  Users,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/collection', label: 'Collection', icon: Library, requireWrite: false },
  { to: '/upload', label: 'Upload', icon: Upload, requireWrite: true },
  { to: '/processing', label: 'Processing', icon: Loader, requireWrite: true },
  { to: '/stats', label: 'Stats', icon: BarChart3, requireWrite: false },
  { to: '/face-collection', label: 'Face Collection', icon: Users, requireWrite: true },
  { to: '/settings', label: 'Settings', icon: Settings, requireModify: true },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { canWrite, canModify } = useAuthStore();
  const location = useLocation();

  const filteredItems = navItems.filter((item) => {
    if (item.requireModify) return canModify;
    if (item.requireWrite) return canWrite;
    return true;
  });

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex flex-col border-r border-border bg-background transition-all duration-200',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        <Logo collapsed={collapsed} />
        <Separator />

        <nav className="flex-1 space-y-1 px-2 py-4">
          {filteredItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            const Icon = item.icon;

            const link = (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'border-l-2 border-accent bg-accent-light text-accent'
                    : 'text-text-secondary hover:bg-accent-light/50 hover:text-text'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return link;
          })}
        </nav>

        <div className="border-t border-border p-2">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-accent-light/50 hover:text-text"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
