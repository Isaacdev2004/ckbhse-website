import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@workspace/ui/components/toaster';
import { TooltipProvider } from '@workspace/ui/components/tooltip';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { GlobalStructuredData } from '@/components/page-head';
import { contentLoader } from '@/lib/content';
import { buildGlobalStructuredData } from '@/lib/seo';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import Services from '@/pages/services';
import Industries from '@/pages/industries';
import IndustryPage from '@/pages/industry-page';
import Resources from '@/pages/resources';
import ResourcePage from '@/pages/resource-page';
import Knowledge from '@/pages/knowledge';
import CaseStudies from '@/pages/case-studies';
import CaseStudyPage from '@/pages/case-study-page';
import Testimonials from '@/pages/testimonials';
import TestimonialPage from '@/pages/testimonial-page';
import ClientSuccess from '@/pages/client-success';
import ClientSuccessStoryPage from '@/pages/client-success-story-page';
import Careers from '@/pages/careers';
import Faq from '@/pages/faq';
import Contact from '@/pages/contact';
import PrivacyPolicy from '@/pages/privacy-policy';
import TermsConditions from '@/pages/terms-conditions';
import CookiePolicy from '@/pages/cookie-policy';
import AccessibilityStatement from '@/pages/accessibility-statement';
import CorporatePage from '@/pages/corporate-page';
import ServicePage from '@/pages/service-page';
import { Route, Switch, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const corporateRoutes = contentLoader
  .getCorporatePages()
  .map((page) => page.path);

function Router() {
  const globalSchema = useMemo(() => {
    const site = contentLoader.getSiteConfig();
    return buildGlobalStructuredData({
      organization: {
        name: site.brand.name,
        url: '',
        email: site.contact.email,
        telephone: site.contact.phone,
        addressLocality: site.contact.location,
        addressCountry: 'GB',
      },
      websiteDescription: `${site.brand.tagline} ${site.brand.description}`,
    });
  }, []);

  return (
    <>
      <GlobalStructuredData data={globalSchema} />
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services/:category/:slug" component={ServicePage} />
        <Route path="/services" component={Services} />
        <Route path="/industries/:slug" component={IndustryPage} />
        <Route path="/industries" component={Industries} />
        <Route path="/resources/:type/:slug" component={ResourcePage} />
        <Route path="/resources" component={Resources} />
        <Route path="/knowledge" component={Knowledge} />
        <Route path="/case-studies/:industry/:slug" component={CaseStudyPage} />
        <Route path="/case-studies" component={CaseStudies} />
        <Route path="/testimonials/:slug" component={TestimonialPage} />
        <Route path="/testimonials" component={Testimonials} />
        <Route path="/client-success/:slug" component={ClientSuccessStoryPage} />
        <Route path="/client-success" component={ClientSuccess} />
        <Route path="/careers" component={Careers} />
        <Route path="/faq" component={Faq} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-conditions" component={TermsConditions} />
        <Route path="/cookie-policy" component={CookiePolicy} />
        <Route path="/legal/accessibility" component={AccessibilityStatement} />
        {corporateRoutes.map((path) => (
          <Route key={path} path={path} component={CorporatePage} />
        ))}
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
