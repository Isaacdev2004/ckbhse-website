import { Link, useLocation } from 'wouter';
import { cn } from '@workspace/ui/utils';
import { PortalLayout } from '@/components/portal-layout';

const nav = [
  { href: '/inspections', label: 'Inspections' },
  { href: '/inspections/calendar', label: 'Calendar' },
  { href: '/inspections/history', label: 'History' },
] as const;

export function InspectionLayout({ children }: { children: React.ReactNode }) {
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
