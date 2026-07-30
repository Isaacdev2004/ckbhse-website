import { Link, useLocation } from 'wouter';
import { cn } from '@workspace/ui/utils';
import { PortalLayout } from '@/components/portal-layout';

const nav = [
  { href: '/risk-assessments', label: 'Assessments' },
  { href: '/risk-assessments/dashboard', label: 'Dashboard' },
  { href: '/risk-assessments/heatmap', label: 'Heat Map' },
] as const;

export function RiskLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return (
    <PortalLayout>
      <div className="space-y-6">
        <nav className="flex flex-wrap gap-2 border-b pb-4">
          {nav.map(({ href, label }) => (
            <Link key={href} href={href} className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium',
              location === href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted',
            )}>{label}</Link>
          ))}
        </nav>
        {children}
      </div>
    </PortalLayout>
  );
}
