import { contentLoader } from '@/lib/content';
import { LegalPageView } from '@/components/legal/legal-page-view';

export default function CookiePolicy() {
  return (
    <LegalPageView
      content={contentLoader.getCookiePolicyPage()}
      path="/cookie-policy"
    />
  );
}
