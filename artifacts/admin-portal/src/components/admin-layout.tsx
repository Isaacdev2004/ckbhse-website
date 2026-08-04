import { Link, useLocation } from 'wouter';
import {
  Building2,
  FileText,
  Flag,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Server,
  Shield,
  Users,
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/utils';
import { useAuth } from '@/providers/auth-provider';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cms', label: 'CMS', icon: FileText },
  { href: '/organizations', label: 'Organizations', icon: Building2 },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/roles', label: 'Roles', icon: Shield },
  { href: '/permissions', label: 'Permissions', icon: Shield },
  { href: '/audit-log', label: 'Audit log', icon: ScrollText },
  { href: '/feature-flags', label: 'Feature flags', icon: Flag },
  { href: '/system', label: 'System', icon: Server },
] as const;

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, session } = useAuth();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-border bg-card lg:border-b-0 lg:border-r">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <img
            src={`${import.meta.env.BASE_URL}brand/ckbhse-icon.png`}
            alt=""
            className="h-8 w-8 object-contain"
            width={32}
            height={32}
          />
          <span className="text-sm font-semibold tracking-wide text-primary">
            CKBHSE Admin
          </span>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href || location.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
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
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-card px-4">
          <p className="text-sm text-muted-foreground">Platform governance</p>
          <div className="flex items-center gap-2">
            {session ? (
              <span className="hidden text-xs text-muted-foreground md:inline">
                {session.userId.slice(0, 8)}…
              </span>
            ) : null}
            <Button variant="ghost" size="sm" onClick={() => void logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
