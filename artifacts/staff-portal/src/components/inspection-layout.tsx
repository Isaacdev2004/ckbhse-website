import { Link, useLocation } from 'wouter';
import { cn } from '@workspace/ui/utils';
import { StaffLayout } from '@/components/staff-layout';

const nav = [
  { href: '/inspections/dashboard', label: 'Dashboard' },
  { href: '/inspections', label: 'All Inspections' },
  { href: '/inspections/calendar', label: 'Calendar' },
  { href: '/inspections/new', label: 'New Inspection' },
  { href: '/compliance', label: 'Compliance Workspace' },
] as const;

export function InspectionLayout({ children }: { children: React.ReactNode }) {
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
