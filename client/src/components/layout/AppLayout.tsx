import { Menu, Moon, Sun, Gauge, FolderKanban, Users2, Settings as SettingsIcon, FileClock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useContext } from 'react';
import { ThemeContext } from '../theme/ThemeProvider';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from './partials/Sheet';
import { useMe, useLogout } from '../../api/hooks';
import { cn } from '../../lib/utils';

const nav = [
  { to: '/', label: 'Dashboard', icon: Gauge },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/users', label: 'Users', icon: Users2 },
  { to: '/audit', label: 'Audit', icon: FileClock, adminOnly: true },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const me = useMe();
  const { pathname } = useLocation();
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col gap-2 p-3 border-r bg-card">
      <div className="px-2 py-3 text-lg font-semibold">Mini CRM</div>
      {nav.map((n) => {
        if (n.adminOnly && me?.role !== 'ADMIN') return null;
        const ActiveIcon = n.icon;
        const active = pathname === n.to || (n.to !== '/' && pathname.startsWith(n.to));
        return (
          <Link key={n.to} to={n.to} onClick={onNavigate} className={cn('flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent', active && 'bg-accent font-medium')}>
            <ActiveIcon className="h-4 w-4" /> {n.label}
          </Link>
        );
      })}
    </aside>
  );
}

function HeaderBar() {
  const me = useMe();
  const logout = useLogout();
  const { theme, setTheme } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="flex h-14 items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <Sidebar onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="hidden md:block text-base font-semibold">Mini CRM</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="h-4 w-4 hidden dark:block" />
          </Button>
          <div className="text-xs text-muted-foreground hidden sm:block">{me?.email} • {me?.role}</div>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
      </div>
    </header>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderBar />
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[16rem_1fr]">
        <Sidebar />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
