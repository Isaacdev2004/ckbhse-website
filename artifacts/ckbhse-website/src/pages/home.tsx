import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, GraduationCap } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
  SectionReveal,
  StaggerContainer,
  staggerItem,
} from '@/components/section-reveal';
import { StatCard } from '@/components/stat-card';
import { PageShell } from '@/components/page-shell';
import { PageContainer } from '@/components/page-container';
import { contentLoader } from '@/lib/content';
import { resolveIcon } from '@/lib/icons';
import heroConstruction from '@/assets/hero-construction.jpg';
import heroConsulting from '@/assets/hero-consulting.jpg';

export default function Home() {
  const content = contentLoader.getHomePage();

  return (
    <PageShell withNavOffset={false} seo={content.seo} path="/">
      <div className="min-h-screen">
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90">
          <div className="absolute inset-0 z-0">
            <img
              src={heroConstruction}
              alt="Construction site safety"
              className="w-full h-full object-cover opacity-20"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-transparent" />
          </div>

          <PageContainer className="relative z-10 py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] as const }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-block mb-6"
                >
                  <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
                    {content.hero.badge}
                  </span>
                </motion.div>

                <h1
                  id="page-title"
                  tabIndex={-1}
                  className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-secondary-foreground mb-6 leading-tight outline-none"
                >
                  {content.hero.title}
                  <br />
                  <span className="text-primary">
                    {content.hero.titleHighlight}
                  </span>
                </h1>

                <p className="text-xl text-secondary-foreground/80 mb-8 leading-relaxed max-w-2xl">
                  {content.hero.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/contact"
                    data-testid="button-book-consultation-hero"
                  >
                    <Button
                      size="lg"
                      className="text-base px-8 py-6 font-semibold group"
                    >
                      Book Free Consultation
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/services" data-testid="link-explore-services">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-base px-8 py-6 font-semibold bg-secondary-foreground/5 border-secondary-foreground/20 hover:bg-secondary-foreground/10"
                    >
                      Explore Services
                    </Button>
                  </Link>
                </div>

                <div className="mt-12 flex flex-wrap gap-6">
                  {content.trustSignals.slice(0, 3).map((signal, index) => (
                    <motion.div
                      key={signal}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                      className="flex items-center gap-2 text-sm text-secondary-foreground/70"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>{signal}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.3,
                  ease: [0.4, 0, 0.2, 1] as const,
                }}
                className="hidden lg:block"
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-primary/20 rounded-2xl blur-3xl" />
                  <img
                    src={heroConsulting}
                    alt="HSEQ consultant meeting"
                    className="relative rounded-2xl shadow-2xl w-full"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </motion.div>
            </div>
          </PageContainer>
        </section>

        <SectionReveal className="py-20 bg-muted/30">
          <PageContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.stats.map((stat, index) => (
                <StatCard
                  key={stat.label}
                  icon={resolveIcon(stat.icon)}
                  value={stat.value}
                  label={stat.label}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </PageContainer>
        </SectionReveal>

        <SectionReveal className="py-24 bg-background">
          <PageContainer>
            <div className="text-center mb-16">
              <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
                {content.sections.services.title}
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {content.sections.services.description}
              </p>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {content.coreServices.map((service) => {
                const Icon = resolveIcon(service.icon);
                return (
                  <motion.div
                    key={service.title}
                    variants={staggerItem}
                    className="bg-card border border-card-border rounded-xl p-8 hover:shadow-xl hover:border-primary/50 transition-all group"
                  >
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-xl text-foreground mb-3">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </motion.div>
                );
              })}
            </StaggerContainer>

            <div className="text-center mt-12">
              <Link href="/services" data-testid="link-view-all-services">
                <Button size="lg" variant="outline" className="group">
                  View All Services
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </PageContainer>
        </SectionReveal>

        <SectionReveal className="py-24 bg-muted/30">
          <PageContainer>
            <div className="text-center mb-16">
              <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
                {content.sections.industries.title}
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {content.sections.industries.description}
              </p>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.industries.map((industry) => {
                const Icon = resolveIcon(industry.icon);
                return (
                  <motion.div
                    key={industry.name}
                    variants={staggerItem}
                    className="bg-card border border-card-border rounded-xl p-6 text-center hover:shadow-lg hover:border-primary/50 transition-all group"
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all">
                      <Icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                      {industry.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {industry.description}
                    </p>
                  </motion.div>
                );
              })}
            </StaggerContainer>

            <div className="text-center mt-12">
              <Link href="/industries" data-testid="link-view-all-industries">
                <Button size="lg" variant="outline" className="group">
                  View All Industries
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </PageContainer>
        </SectionReveal>

        <SectionReveal className="py-24 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <PageContainer variant="narrow" className="text-center">
            <GraduationCap className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-6">
              {content.sections.training.title}
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8 leading-relaxed">
              {content.sections.training.description}
            </p>
            <Link href="/training" data-testid="link-browse-courses">
              <Button
                size="lg"
                variant="secondary"
                className="font-semibold group"
              >
                Browse Courses
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </PageContainer>
        </SectionReveal>

        <SectionReveal className="py-24 bg-background">
          <PageContainer variant="narrow" className="text-center">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6">
              {content.sections.finalCta.title}
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {content.sections.finalCta.description}
            </p>
            <Link href="/contact" data-testid="button-get-started">
              <Button
                size="lg"
                className="text-lg px-10 py-6 font-semibold group"
              >
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </PageContainer>
        </SectionReveal>
      </div>
    </PageShell>
  );
}
