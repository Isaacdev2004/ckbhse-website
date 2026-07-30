import { PortalListPage } from './portal-list-page';

export default function ActivityPage() {
  return (
    <PortalListPage
      title="Activity centre"
      description="Unified timeline across projects, documents, training, and support"
      path="/activity"
      renderItem={(item) => (
        <div>
          <div className="text-xs uppercase text-muted-foreground">
            {String(item.kind ?? '')}
          </div>
          <div>{String(item.summary ?? '')}</div>
        </div>
      )}
    />
  );
}
