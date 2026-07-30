import { contentLoader } from '@/lib/content';
import { LegalPageView } from '@/components/legal/legal-page-view';

export default function AccessibilityStatement() {
  return (
    <LegalPageView
      content={contentLoader.getAccessibilityStatementPage()}
      path="/legal/accessibility"
    />
  );
}
