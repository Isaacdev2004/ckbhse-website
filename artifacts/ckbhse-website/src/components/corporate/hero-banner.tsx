import { motion } from 'framer-motion';
import type { PageHero } from '@workspace/content/schemas';
import { PageContainer } from '@/components/page-container';

interface CorporateHeroBannerProps {
  hero: PageHero;
}

export function CorporateHeroBanner({ hero }: CorporateHeroBannerProps) {
  return (
    <section className="bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 text-secondary-foreground py-24">
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }}
          className="max-w-4xl"
        >
          {hero.badge && (
            <p className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-4">
              {hero.badge}
            </p>
          )}
          <h1
            id="page-title"
            tabIndex={-1}
            className="font-display font-bold text-5xl md:text-6xl mb-6 outline-none"
          >
            {hero.title}
          </h1>
          <p className="text-xl opacity-90 leading-relaxed">
            {hero.description}
          </p>
        </motion.div>
      </PageContainer>
    </section>
  );
}
