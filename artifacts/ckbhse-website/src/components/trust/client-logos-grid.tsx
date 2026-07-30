import type { ClientLogo } from '@workspace/content/schemas';

interface ClientLogosGridProps {
  logos: ClientLogo[];
}

export function ClientLogosGrid({ logos }: ClientLogosGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {logos.map((logo) => (
        <div
          key={logo.name}
          className="bg-muted/30 border border-border rounded-lg p-4 flex items-center justify-center min-h-[80px] text-center"
        >
          <span className="text-sm font-medium text-muted-foreground">
            {logo.name}
          </span>
        </div>
      ))}
    </div>
  );
}
