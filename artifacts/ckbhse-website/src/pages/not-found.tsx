import { Card, CardContent } from '@workspace/ui/components/card';
import { AlertCircle } from 'lucide-react';
import { getPublicRoutes } from '@workspace/seo/routes';
import { PageShell } from '@/components/page-shell';

const notFoundRoute = getPublicRoutes().find(
  (route) => route.id === 'not-found',
);

export default function NotFound() {
  const seo = notFoundRoute?.getSeo() ?? {
    title: 'Page Not Found | CKBHSE Limited',
    description: 'The page you requested could not be found.',
    noindex: true,
  };

  return (
    <PageShell seo={seo} path="/404">
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1
                id="page-title"
                tabIndex={-1}
                className="text-2xl font-bold text-gray-900 outline-none"
              >
                404 Page Not Found
              </h1>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Did you forget to add the page to the router?
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
