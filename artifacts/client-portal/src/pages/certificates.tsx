import { PortalListPage } from './portal-list-page';

export default function CertificatesPage() {
  return (
    <PortalListPage
      title="Certificates"
      description="ISO, training, and compliance certificates with expiry monitoring"
      path="/certificates"
      renderItem={(item) => (
        <div>
          <div className="font-medium">{String(item.name ?? '')}</div>
          <div className="text-sm text-muted-foreground">
            {String(item.certificateType ?? '')} · {String(item.verificationStatus ?? '')}
          </div>
        </div>
      )}
    />
  );
}
