import { contentLoader } from '@/lib/content';
import { LegalPageView } from '@/components/legal/legal-page-view';

export default function PrivacyPolicy() {
  return (
    <LegalPageView
      content={contentLoader.getPrivacyPolicyPage()}
      path="/privacy-policy"
    />
  );
}
