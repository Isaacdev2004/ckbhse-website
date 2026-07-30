import { useRoute } from 'wouter';
import { contentLoader } from '@/lib/content';
import { CoursePageView } from '@/components/training/course-page-view';
import NotFound from '@/pages/not-found';

export default function CoursePage() {
  const [, params] = useRoute('/training/:category/:slug');

  if (!params?.category || !params?.slug) {
    return <NotFound />;
  }

  const page = contentLoader.getCoursePage(params.category, params.slug);

  if (!page) {
    return <NotFound />;
  }

  return <CoursePageView page={page} />;
}
