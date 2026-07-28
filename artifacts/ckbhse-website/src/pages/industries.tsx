import { motion } from 'framer-motion';
import {
  Building2,
  Factory,
  Truck,
  Droplet,
  Heart,
  GraduationCap,
  Store,
  Building,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@workspace/ui/components/button';
import {
  SectionReveal,
  StaggerContainer,
  staggerItem,
} from '@/components/section-reveal';

const industries = [
  {
    id: 'construction',
    icon: Building2,
    name: 'Construction',
    description:
      'Comprehensive HSEQ support for construction sites, contractors, and project managers.',
    challenges: [
      'CDM 2015 compliance',
      'Site safety management',
      'Multi-contractor coordination',
      'High-risk activities',
    ],
    solutions: [
      'Principal Designer services',
      'Site safety audits and inspections',
      'Construction Phase Plans',
      'Risk assessments and method statements',
      'Toolbox talks and site inductions',
      'CDM compliance documentation',
    ],
  },
  {
    id: 'manufacturing',
    icon: Factory,
    name: 'Manufacturing',
    description:
      'Safety systems, ISO compliance, and operational risk management for manufacturing facilities.',
    challenges: [
      'Machinery safety and guarding',
      'ISO certification requirements',
      'Occupational health risks',
      'Environmental compliance',
    ],
    solutions: [
      'ISO 9001, 14001, 45001 implementation',
      'Machinery risk assessments',
      'COSHH and chemical management',
      'Noise and vibration assessments',
      'Process safety management',
      'Environmental impact assessments',
    ],
  },
  {
    id: 'logistics',
    icon: Truck,
    name: 'Logistics & Transport',
    description:
      'Fleet safety, driver compliance, and warehouse operations support.',
    challenges: [
      'Driver hours and fatigue',
      'Loading and unloading risks',
      'Warehouse safety',
      'Fleet compliance',
    ],
    solutions: [
      'Driver safety training and assessments',
      'Warehouse risk assessments',
      'Manual handling programs',
      'Fork-lift truck safety',
      'Loading bay inspections',
      'Transport safety policies',
    ],
  },
  {
    id: 'oil-gas',
    icon: Droplet,
    name: 'Oil & Gas',
    description:
      'High-risk work procedures, process safety, and regulatory compliance for energy sector operations.',
    challenges: [
      'High-consequence hazards',
      'Complex permit-to-work systems',
      'Offshore and onshore risks',
      'Regulatory scrutiny',
    ],
    solutions: [
      'Permit-to-work system design',
      'Process safety management',
      'Emergency response planning',
      'Major accident hazard analysis',
      'Safety case development',
      'Competency assurance systems',
    ],
  },
  {
    id: 'healthcare',
    icon: Heart,
    name: 'Healthcare',
    description:
      'Clinical and non-clinical safety, infection control, and compliance for healthcare providers.',
    challenges: [
      'Infection prevention',
      'Patient and staff safety',
      'Clinical risk management',
      'CQC compliance',
    ],
    solutions: [
      'Infection prevention audits',
      'Clinical risk assessments',
      'COSHH for healthcare settings',
      'Fire safety in care settings',
      'Manual handling for patient care',
      'CQC compliance support',
    ],
  },
  {
    id: 'education',
    icon: GraduationCap,
    name: 'Educational Institutions',
    description:
      'Health and safety management for schools, colleges, and universities.',
    challenges: [
      'Safeguarding and duty of care',
      'Science lab safety',
      'Staff and student wellbeing',
      'Emergency planning',
    ],
    solutions: [
      'School safety policies',
      'Fire evacuation planning',
      'Science lab risk assessments',
      'Staff safety training',
      'Playground and sports safety',
      'Educational visit planning',
    ],
  },
  {
    id: 'sme',
    icon: Store,
    name: 'Small & Medium Enterprises',
    description: 'Affordable, scalable HSEQ support for growing businesses.',
    challenges: [
      'Limited internal resources',
      'Cost-effective compliance',
      'Practical safety solutions',
      'Basic policy frameworks',
    ],
    solutions: [
      'Essential health & safety policies',
      'Workplace risk assessments',
      'Staff training programs',
      'Compliance health checks',
      'Cost-effective retainer packages',
      'Template documentation',
    ],
  },
  {
    id: 'enterprise',
    icon: Building,
    name: 'Large Enterprises',
    description:
      'Strategic HSEQ consulting, multi-site management, and enterprise-wide compliance programs.',
    challenges: [
      'Multi-site coordination',
      'Complex regulatory landscape',
      'Board-level reporting',
      'Enterprise safety culture',
    ],
    solutions: [
      'Enterprise HSEQ strategy',
      'Multi-site audit programs',
      'Executive safety dashboards',
      'Safety culture assessments',
      'Dedicated consultant teams',
      'Global compliance support',
    ],
  },
];

export default function Industries() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 text-secondary-foreground py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }}
            className="max-w-4xl"
          >
            <h1 className="font-display font-bold text-5xl md:text-6xl mb-6">
              Industry-Specific Expertise
            </h1>
            <p className="text-xl opacity-90 leading-relaxed">
              Tailored HSEQ solutions for the unique challenges, regulations,
              and risk profiles of your sector.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 gap-12">
            {industries.map((industry) => (
              <motion.div
                key={industry.id}
                variants={staggerItem}
                id={industry.id}
                className="bg-card border border-card-border rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="grid lg:grid-cols-3 gap-8 p-8 lg:p-10">
                  {/* Header */}
                  <div className="lg:col-span-3">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <industry.icon className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-3xl text-foreground mb-2">
                          {industry.name}
                        </h2>
                        <p className="text-lg text-muted-foreground">
                          {industry.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Challenges */}
                  <div>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                      Common Challenges
                    </h3>
                    <ul className="space-y-2">
                      {industry.challenges.map((challenge, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Solutions */}
                  <div className="lg:col-span-2">
                    <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                      How We Help
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {industry.solutions.map((solution, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          </div>
                          <span className="text-sm text-foreground">
                            {solution}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-8 lg:px-10 pb-8">
                  <Link
                    href="/contact"
                    data-testid={`button-discuss-${industry.id}`}
                  >
                    <Button variant="outline" className="group">
                      Discuss {industry.name} Solutions
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <SectionReveal className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6">
            Don't See Your Industry?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            We work across a wide range of sectors. Get in touch to discuss your
            specific industry requirements.
          </p>
          <Link href="/contact" data-testid="button-contact-us">
            <Button size="lg" className="font-semibold group">
              Contact Our Team
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </SectionReveal>
    </div>
  );
}
