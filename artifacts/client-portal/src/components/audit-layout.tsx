import { Link, useLocation } from 'wouter';
import { cn } from '@workspace/ui/utils';
import { PortalLayout } from '@/components/portal-layout';

const auditNav = [
  { href: '/audits', label: 'Audits' },
  { href: '/audits/calendar', label: 'Calendar' },
  { href: '/audits/history', label: 'History' },
  { href: '/audits/reports', label: 'Reports' },
] as const;

export function AuditLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <PortalLayout>
      <div className="space-y-6">
        <nav className="flex flex-wrap gap-2 border-b pb-4">
          {auditNav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium',
                location === href || location.startsWith(`${href}/`)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </PortalLayout>
  );
}
