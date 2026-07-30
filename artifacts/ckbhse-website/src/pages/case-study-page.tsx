import { useRoute } from 'wouter';
import { contentLoader } from '@/lib/content';
import { CaseStudyPageView } from '@/components/case-studies/case-study-page-view';
import NotFound from '@/pages/not-found';

export default function CaseStudyPage() {
  const [, params] = useRoute('/case-studies/:industry/:slug');

  if (!params?.industry || !params?.slug) {
    return <NotFound />;
  }

  const page = contentLoader.getCaseStudyPage(params.industry, params.slug);

  if (!page) {
    return <NotFound />;
  }

  return <CaseStudyPageView page={page} />;
}
