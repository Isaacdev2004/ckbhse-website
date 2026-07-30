import { PortalListPage } from './portal-list-page';

export default function IncidentsPage() {
  return (
    <PortalListPage
      title="Incidents"
      description="Incident register, investigations, and close-out status"
      path="/incidents"
      renderItem={(item) => (
        <div>
          <div className="font-medium">{String(item.title ?? '')}</div>
          <div className="text-sm text-muted-foreground">
            {String(item.severity ?? '')} · {String(item.status ?? '')}
          </div>
        </div>
      )}
    />
  );
}
