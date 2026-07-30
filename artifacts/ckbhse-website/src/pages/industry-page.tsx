import { useRoute } from 'wouter';
import { contentLoader } from '@/lib/content';
import { IndustryPageView } from '@/components/industries/industry-page-view';
import NotFound from '@/pages/not-found';

export default function IndustryPage() {
  const [, params] = useRoute('/industries/:slug');

  if (!params?.slug) {
    return <NotFound />;
  }

  const page = contentLoader.getIndustryPage(params.slug);

  if (!page) {
    return <NotFound />;
  }

  return <IndustryPageView page={page} />;
}
