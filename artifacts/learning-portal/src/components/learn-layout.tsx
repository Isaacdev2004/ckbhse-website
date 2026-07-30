import { Link, useLocation } from 'wouter';
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Users,
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/utils';
import { useAuth } from '@/providers/auth-provider';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/sessions', label: 'Sessions', icon: Calendar },
  { href: '/attendance', label: 'Attendance', icon: Users },
  { href: '/assessments', label: 'Assessments', icon: ClipboardCheck },
  { href: '/certificates', label: 'Certificates', icon: Award },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
] as const;

export function LearnLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, session } = useAuth();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b bg-card lg:border-b-0 lg:border-r">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-sm font-semibold tracking-wide text-primary">
            CKBHSE Trainer
          </span>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href || location.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-h-screen flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4">
          <span className="text-sm text-muted-foreground">
            {session?.userId ?? 'Trainer workspace'}
          </span>
          <Button variant="ghost" size="sm" onClick={() => void logout()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
