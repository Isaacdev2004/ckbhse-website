import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Award,
  Users,
  Building2,
  Factory,
  Truck,
  Droplet,
  GraduationCap,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
  SectionReveal,
  StaggerContainer,
  staggerItem,
} from '@/components/section-reveal';
import { StatCard } from '@/components/stat-card';
import heroConstruction from '@/assets/hero-construction.jpg';
import heroConsulting from '@/assets/hero-consulting.jpg';

const coreServices = [
  {
    icon: Shield,
    title: 'Health & Safety Audits',
    description:
      'Comprehensive workplace inspections and compliance assessments to identify risks and ensure regulatory adherence.',
  },
  {
    icon: FileCheck,
    title: 'Risk Assessments & RAMS',
    description:
      'Detailed risk analysis and method statements tailored to your operations and industry requirements.',
  },
  {
    icon: Award,
    title: 'ISO Compliance',
    description:
      'Expert guidance for ISO 9001, 14001, and 45001 certification, implementation, and ongoing management.',
  },
  {
    icon: AlertTriangle,
    title: 'Incident Investigation',
    description:
      'Professional analysis of workplace incidents with actionable recommendations to prevent recurrence.',
  },
];

const industries = [
  {
    icon: Building2,
    name: 'Construction',
    description: 'CDM compliance, site safety, RAMS',
  },
  {
    icon: Factory,
    name: 'Manufacturing',
    description: 'Machinery safety, ISO systems',
  },
  {
    icon: Truck,
    name: 'Logistics',
    description: 'Fleet safety, driver compliance',
  },
  {
    icon: Droplet,
    name: 'Oil & Gas',
    description: 'High-risk procedures, PTW systems',
  },
];

const trustSignals = [
  'ISO 9001 Certified Consultancy',
  'IOSH Accredited Training',
  'NEBOSH Qualified Consultants',
  'CDM 2015 Specialists',
  'HSE Regulatory Expertise',
  'RIDDOR Compliance',
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroConstruction}
            alt="Construction site safety"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
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
                  UK HSEQ Consultancy
                </span>
              </motion.div>

              <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-secondary-foreground mb-6 leading-tight">
                Expert Safety.
                <br />
                <span className="text-primary">Real Results.</span>
              </h1>

              <p className="text-xl text-secondary-foreground/80 mb-8 leading-relaxed max-w-2xl">
                CKBHSE Limited delivers comprehensive Health, Safety,
                Environment & Quality consultancy services to organisations
                across the UK. From compliance audits to ISO certification,
                we're the partner you can trust.
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
                {trustSignals.slice(0, 3).map((signal, index) => (
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
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <SectionReveal className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              value="500+"
              label="Clients Served"
              delay={0}
            />
            <StatCard
              icon={Award}
              value="15+"
              label="Years Experience"
              delay={0.1}
            />
            <StatCard
              icon={GraduationCap}
              value="2,000+"
              label="Professionals Trained"
              delay={0.2}
            />
            <StatCard
              icon={Shield}
              value="98.7%"
              label="Compliance Success Rate"
              delay={0.3}
            />
          </div>
        </div>
      </SectionReveal>

      {/* Core Services */}
      <SectionReveal className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
              Complete HSEQ Solutions
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From compliance audits to ongoing safety management, we provide
              end-to-end consultancy services that keep your business safe and
              compliant.
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coreServices.map((service) => (
              <motion.div
                key={service.title}
                variants={staggerItem}
                className="bg-card border border-card-border rounded-xl p-8 hover:shadow-xl hover:border-primary/50 transition-all group"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </StaggerContainer>

          <div className="text-center mt-12">
            <Link href="/services" data-testid="link-view-all-services">
              <Button size="lg" variant="outline" className="group">
                View All Services
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </SectionReveal>

      {/* Industries */}
      <SectionReveal className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
              Industries We Serve
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Sector-specific expertise across high-risk and regulated
              industries.
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry) => (
              <motion.div
                key={industry.name}
                variants={staggerItem}
                className="bg-card border border-card-border rounded-xl p-6 text-center hover:shadow-lg hover:border-primary/50 transition-all group"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all">
                  <industry.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {industry.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {industry.description}
                </p>
              </motion.div>
            ))}
          </StaggerContainer>

          <div className="text-center mt-12">
            <Link href="/industries" data-testid="link-view-all-industries">
              <Button size="lg" variant="outline" className="group">
                View All Industries
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </SectionReveal>

      {/* Training CTA */}
      <SectionReveal className="py-24 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-6">
            Accredited Safety Training
          </h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8 leading-relaxed">
            IOSH, NEBOSH, and specialist courses delivered by qualified
            professionals. Classroom and online options available.
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
        </div>
      </SectionReveal>

      {/* Final CTA */}
      <SectionReveal className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6">
            Ready to improve workplace safety?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Book a free consultation with one of our HSEQ experts. We'll assess
            your needs and recommend tailored solutions.
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
        </div>
      </SectionReveal>
    </div>
  );
}
