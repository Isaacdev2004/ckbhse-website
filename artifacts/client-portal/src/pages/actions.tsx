import { PortalListPage } from './portal-list-page';

export default function ActionsPage() {
  return (
    <PortalListPage
      title="Action register"
      description="Open, overdue, and completed corrective actions"
      path="/actions"
      renderItem={(item) => (
        <div>
          <div className="font-medium">{String(item.title ?? '')}</div>
          <div className="text-sm text-muted-foreground">
            {String(item.priority ?? '')} · {String(item.status ?? '')}
          </div>
        </div>
      )}
    />
  );
}
