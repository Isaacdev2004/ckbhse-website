import { Link, useLocation } from 'wouter';
import { cn } from '@workspace/ui/utils';
import { StaffLayout } from '@/components/staff-layout';

const nav = [
  { href: '/reporting', label: 'Executive' },
  { href: '/reporting/reports', label: 'Reports' },
  { href: '/reporting/schedules', label: 'Schedules' },
  { href: '/reporting/insights', label: 'Insights' },
  { href: '/reporting/benchmarks', label: 'Benchmarks' },
  { href: '/reporting/bi', label: 'Power BI' },
  { href: '/reporting/compliance', label: 'Compliance' },
  { href: '/reporting/audit', label: 'Audit' },
  { href: '/reporting/crm', label: 'CRM' },
  { href: '/reporting/learning', label: 'Learning' },
  { href: '/reporting/risk', label: 'Risk' },
] as const;

export function ReportingLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Reporting Hub</h1>
          <p className="text-sm text-muted-foreground">
            Cross-platform analytics powered by the KPI engine
          </p>
        </div>
        <nav className="flex flex-wrap gap-2 border-b pb-4">
          {nav.map(({ href, label }) => {
            const active =
              href === '/reporting'
                ? location === '/reporting' || location === '/reporting/'
                : href === '/reporting/reports'
                  ? location.startsWith('/reporting/reports')
                  : location === '/reporting/insights' ||
                      location === '/reporting/benchmarks' ||
                      location === '/reporting/bi'
                    ? location === href
                    : location.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        {children}
      </div>
    </StaffLayout>
  );
}
