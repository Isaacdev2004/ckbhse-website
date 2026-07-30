import { motion } from 'framer-motion';
import { Users, MapPin, Briefcase, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
  SectionReveal,
  StaggerContainer,
  staggerItem,
} from '@/components/section-reveal';
import { PageShell } from '@/components/page-shell';
import { PageContainer } from '@/components/page-container';
import { contentLoader } from '@/lib/content';
import { resolveIcon } from '@/lib/icons';

export default function Careers() {
  const content = contentLoader.getCareersPage();

  return (
    <PageShell seo={content.seo} path="/careers">
      <section className="bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 text-secondary-foreground py-24">
        <PageContainer>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }}
            className="max-w-4xl"
          >
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

      <SectionReveal className="py-20 bg-muted/30">
        <PageContainer>
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">
              {content.benefitsHeading.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {content.benefitsHeading.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.benefits.map((benefit, index) => {
              const Icon = resolveIcon(benefit.icon);
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card border border-card-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </PageContainer>
      </SectionReveal>

      <section className="py-20 bg-background">
        <PageContainer>
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">
              {content.positionsHeading.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {content.positionsHeading.description}
            </p>
          </div>

          <StaggerContainer className="space-y-6">
            {content.positions.map((position) => (
              <motion.div
                key={position.slug}
                variants={staggerItem}
                className="bg-card border border-card-border rounded-xl p-8 hover:shadow-xl hover:border-primary/50 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="font-display font-bold text-2xl text-foreground">
                        {position.title}
                      </h3>
                      <Badge>{position.type}</Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {position.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {position.salary}
                      </span>
                    </div>

                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {position.description}
                    </p>

                    <div>
                      <h4 className="font-semibold text-sm text-foreground mb-2">
                        Key Requirements:
                      </h4>
                      <ul className="space-y-1">
                        {position.requirements.map((req, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="lg:w-48">
                    <Link
                      href="/contact"
                      data-testid={`button-apply-${position.slug}`}
                    >
                      <Button className="w-full group">
                        Apply Now
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </StaggerContainer>
        </PageContainer>
      </section>

      <SectionReveal className="py-24 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <PageContainer variant="narrow" className="text-center">
          <Users className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-6">
            {content.generalApplicationCta.title}
          </h2>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            {content.generalApplicationCta.description}
          </p>
          <Link href="/contact" data-testid="button-general-application">
            <Button
              size="lg"
              variant="secondary"
              className="font-semibold group"
            >
              Submit General Application
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </PageContainer>
      </SectionReveal>
    </PageShell>
  );
}
