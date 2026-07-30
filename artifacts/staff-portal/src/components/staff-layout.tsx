import { Link, useLocation } from 'wouter';
import { LayoutDashboard, LogOut, Users, ClipboardList, ShieldCheck, Wrench, AlertTriangle, BarChart3 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/utils';
import { useAuth } from '@/providers/auth-provider';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/audits/dashboard', label: 'Audits', icon: ClipboardList },
  { href: '/inspections/dashboard', label: 'Inspections', icon: ShieldCheck },
  { href: '/capa/dashboard', label: 'CAPA', icon: Wrench },
  { href: '/risk-assessments/dashboard', label: 'Risk', icon: AlertTriangle },
  { href: '/compliance', label: 'Compliance', icon: ShieldCheck },
  { href: '/reporting', label: 'Reporting', icon: BarChart3 },
] as const;

export function StaffLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold tracking-wide text-primary">
              CKBHSE Staff
            </span>
            <nav className="hidden items-center gap-1 sm:flex">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active =
                  href === '/' ? location === '/' : location.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}

function LogoutButton() {
  const { logout, session } = useAuth();

  return (
    <div className="flex items-center gap-3">
      {session ? (
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {session.userId.slice(0, 8)}…
        </span>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void logout()}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
