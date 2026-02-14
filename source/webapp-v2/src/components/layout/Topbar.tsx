import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LogOut, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';

export function Topbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, canModify, canWrite } = useAuthStore();
  const { signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collection?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  const roleLabel = canModify ? 'Admin' : canWrite ? 'Creator' : 'Viewer';

  return (
    <div className="flex h-full w-full items-center justify-between px-4 md:px-6">
      <div />

      <div className="flex items-center gap-2 md:gap-4">
        <form onSubmit={handleSearch} className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 md:w-64 pl-9"
          />
        </form>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent-light/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light text-accent">
                <User className="h-4 w-4" />
              </div>
              <span className="hidden font-medium md:inline">{user?.username}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2">
              <span>{user?.username}</span>
              <Badge variant="secondary" className="text-[10px]">
                {roleLabel}
              </Badge>
            </DropdownMenuLabel>
            {user?.email && (
              <p className="px-2 pb-2 text-xs text-text-secondary">{user.email}</p>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
