import { contentLoader } from '@/lib/content';
import { LegalPageView } from '@/components/legal/legal-page-view';

export default function TermsConditions() {
  return (
    <LegalPageView
      content={contentLoader.getTermsConditionsPage()}
      path="/terms-conditions"
    />
  );
}
