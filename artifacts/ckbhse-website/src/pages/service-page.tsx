import { useRoute } from 'wouter';
import { contentLoader } from '@/lib/content';
import { ServicePageView } from '@/components/services/service-page-view';
import NotFound from '@/pages/not-found';

export default function ServicePage() {
  const [, params] = useRoute('/services/:category/:slug');

  if (!params?.category || !params?.slug) {
    return <NotFound />;
  }

  const page = contentLoader.getServicePage(params.category, params.slug);

  if (!page) {
    return <NotFound />;
  }

  return <ServicePageView page={page} />;
}
