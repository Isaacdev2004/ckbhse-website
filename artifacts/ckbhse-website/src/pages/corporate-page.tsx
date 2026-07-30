import { useLocation } from 'wouter';
import { contentLoader } from '@/lib/content';
import { CorporatePageView } from '@/components/corporate/corporate-page-view';
import NotFound from '@/pages/not-found';

export default function CorporatePage() {
  const [location] = useLocation();
  const page = contentLoader.getCorporatePageByPath(location);

  if (!page) {
    return <NotFound />;
  }

  return <CorporatePageView page={page} />;
}
