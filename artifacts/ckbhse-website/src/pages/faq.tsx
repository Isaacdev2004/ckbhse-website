import { motion } from 'framer-motion';
import { PageShell } from '@/components/page-shell';
import { PageContainer } from '@/components/page-container';
import { FaqAccordion } from '@/components/services/faq-accordion';
import { PageStructuredData } from '@/components/page-structured-data';
import { ConsultationBanner } from '@/components/trust/consultation-banner';
import { contentLoader } from '@/lib/content';
import { buildFaqSchema } from '@/lib/seo';

export default function Faq() {
  const content = contentLoader.getFaqPage();
  const faqSchema = buildFaqSchema(content.faqs);

  return (
    <PageShell seo={content.seo} path="/faq">
      <PageStructuredData data={[faqSchema]} />
      <section className="bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 text-secondary-foreground py-24">
        <PageContainer>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }}
            className="max-w-4xl"
          >
            {content.hero.badge ? (
              <p className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-4">
                {content.hero.badge}
              </p>
            ) : null}
            <h1
              id="page-title"
              tabIndex={-1}
              className="font-display font-bold text-5xl md:text-6xl mb-6 outline-none"
            >
              {content.hero.title}
            </h1>
            <p className="text-xl opacity-90 leading-relaxed">
              {content.hero.description}
            </p>
          </motion.div>
        </PageContainer>
      </section>

      <section className="py-16 bg-background">
        <PageContainer variant="narrow">
          <FaqAccordion
            title="Frequently Asked Questions"
            items={content.faqs}
          />
        </PageContainer>
      </section>

      <ConsultationBanner {...content.cta} />
    </PageShell>
  );
}
