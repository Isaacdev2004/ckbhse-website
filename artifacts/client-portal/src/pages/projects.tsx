import { PortalListPage } from './portal-list-page';

export default function ProjectsPage() {
  return (
    <PortalListPage
      title="Projects"
      description="Delivery projects, milestones, and progress"
      path="/projects"
      renderItem={(item) => (
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">{String(item.name ?? '')}</div>
            <div className="text-sm text-muted-foreground">
              {String(item.serviceType ?? 'General')}
            </div>
          </div>
          <div className="text-sm">
            {String(item.progressPercent ?? 0)}% · {String(item.status ?? '')}
          </div>
        </div>
      )}
    />
  );
}
