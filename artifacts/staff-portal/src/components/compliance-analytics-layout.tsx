import { Link, useLocation } from 'wouter';
import { cn } from '@workspace/ui/utils';
import { StaffLayout } from '@/components/staff-layout';

const nav = [
  { href: '/compliance/analytics', label: 'Executive' },
  { href: '/compliance/analytics/regulatory', label: 'Regulatory' },
  { href: '/compliance/analytics/performance', label: 'Performance' },
  { href: '/compliance/analytics/exports', label: 'Exports' },
] as const;

export function ComplianceAnalyticsLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return (
    <StaffLayout>
      <div className="space-y-6">
        <nav className="flex flex-wrap gap-2 border-b pb-4">
          {nav.map(({ href, label }) => (
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
    </StaffLayout>
  );
}
