import { Link, useLocation } from 'wouter';
import { cn } from '@workspace/ui/utils';
import { PortalLayout } from '@/components/portal-layout';

const trainingNav = [
  { href: '/training/dashboard', label: 'Dashboard' },
  { href: '/training/catalogue', label: 'Catalogue' },
  { href: '/training/my-learning', label: 'My Learning' },
  { href: '/training/pathways', label: 'Pathways' },
  { href: '/training/calendar', label: 'Calendar' },
  { href: '/training/certificates', label: 'Certificates' },
  { href: '/training/transcript', label: 'Transcript' },
  { href: '/training/assessments', label: 'Assessments' },
  { href: '/training/history', label: 'History' },
] as const;

export function TrainingLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <PortalLayout>
      <div className="space-y-6">
        <nav className="flex flex-wrap gap-2 border-b pb-4">
          {trainingNav.map(({ href, label }) => (
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
