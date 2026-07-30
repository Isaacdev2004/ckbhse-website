import { Link, useLocation } from 'wouter';
import {
  Activity,
  Award,
  Building2,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Users,
  Wrench,
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { cn } from '@workspace/ui/utils';
import { useAuth } from '@/providers/auth-provider';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'Profile', icon: Users },
  { href: '/organisation', label: 'Organisation', icon: Building2 },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/projects', label: 'Projects', icon: Wrench },
  { href: '/compliance', label: 'Compliance', icon: Shield },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/training', label: 'Training', icon: GraduationCap },
  { href: '/certificates', label: 'Certificates', icon: Award },
  { href: '/audits', label: 'Audits', icon: ClipboardList },
  { href: '/inspections', label: 'Inspections', icon: Shield },
  { href: '/capa', label: 'CAPA', icon: Wrench },
  { href: '/risk-assessments', label: 'Risk', icon: AlertTriangle },
  { href: '/incidents', label: 'Incidents', icon: ShieldAlert },
  { href: '/actions', label: 'Actions', icon: ClipboardList },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/support', label: 'Support', icon: LifeBuoy },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/activity', label: 'Activity', icon: Activity },
] as const;

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, session } = useAuth();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b bg-card lg:border-b-0 lg:border-r">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-sm font-semibold tracking-wide text-primary">
            CKBHSE Portal
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
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-card px-4">
          <form
            className="hidden max-w-md flex-1 sm:flex"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const q = String(data.get('q') ?? '').trim();
              if (q.length > 0) {
                window.location.href = `${import.meta.env.BASE_URL}search?q=${encodeURIComponent(q)}`;
              }
            }}
          >
            <div className="relative w-full">
              <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search workspace…"
                className="pl-9"
                aria-label="Search workspace"
              />
            </div>
          </form>
          <div className="flex items-center gap-2">
            {session ? (
              <span className="hidden text-xs text-muted-foreground md:inline">
                {session.organizationId.slice(0, 8)}…
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
