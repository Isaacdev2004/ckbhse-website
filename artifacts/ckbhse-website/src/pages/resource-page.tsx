import { useRoute } from 'wouter';
import { contentLoader } from '@/lib/content';
import { ResourcePageView } from '@/components/resources/resource-page-view';
import NotFound from '@/pages/not-found';

export default function ResourcePage() {
  const [, params] = useRoute('/resources/:type/:slug');

  if (!params?.type || !params?.slug) {
    return <NotFound />;
  }

  const page = contentLoader.getResourcePage(params.type, params.slug);

  if (!page) {
    return <NotFound />;
  }

  return <ResourcePageView page={page} />;
}
