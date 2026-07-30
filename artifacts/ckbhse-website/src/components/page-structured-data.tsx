import { useEffect } from 'react';

interface PageStructuredDataProps {
  data: Record<string, unknown>[];
}

/** Per-page JSON-LD — Service, FAQ, breadcrumbs, etc. */
export function PageStructuredData({ data }: PageStructuredDataProps) {
  useEffect(() => {
    const id = 'page-jsonld';
    const existing = document.getElementById(id);
    if (existing) {
      existing.textContent = JSON.stringify(data);
      return;
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      document.getElementById(id)?.remove();
    };
  }, [data]);

  return null;
}
