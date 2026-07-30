import { PortalListPage } from './portal-list-page';

export default function DocumentsPage() {
  return (
    <PortalListPage
      title="Documents"
      description="Secure document library with categories and expiry tracking"
      path="/documents"
      renderItem={(item) => (
        <div>
          <div className="font-medium">{String(item.name ?? '')}</div>
          <div className="text-sm text-muted-foreground">
            {String(item.category ?? 'Uncategorised')} · {String(item.status ?? '')}
          </div>
        </div>
      )}
    />
  );
}
