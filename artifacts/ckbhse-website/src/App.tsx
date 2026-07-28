import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import Services from '@/pages/services';
import Industries from '@/pages/industries';
import Training from '@/pages/training';
import Knowledge from '@/pages/knowledge';
import CaseStudies from '@/pages/case-studies';
import Careers from '@/pages/careers';
import Contact from '@/pages/contact';
import PrivacyPolicy from '@/pages/privacy-policy';
import TermsConditions from '@/pages/terms-conditions';
import CookiePolicy from '@/pages/cookie-policy';
import { Route, Switch, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/industries" component={Industries} />
        <Route path="/training" component={Training} />
        <Route path="/knowledge" component={Knowledge} />
        <Route path="/case-studies" component={CaseStudies} />
        <Route path="/careers" component={Careers} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-conditions" component={TermsConditions} />
        <Route path="/cookie-policy" component={CookiePolicy} />
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
