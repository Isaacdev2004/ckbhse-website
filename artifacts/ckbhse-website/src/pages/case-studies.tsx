import { motion } from 'framer-motion';
import {
  Building2,
  Factory,
  Heart,
  Droplet,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { StaggerContainer, staggerItem } from '@/components/section-reveal';

const caseStudies = [
  {
    id: 'construction-london',
    industry: 'Construction',
    icon: Building2,
    client: 'Major London Commercial Development',
    title: 'CDM Compliance for £120M Mixed-Use Development',
    challenge:
      'A 24-storey mixed-use development required comprehensive Principal Designer services to manage complex safety challenges across multiple contractors and high-risk construction phases.',
    solution:
      'CKBHSE Limited provided full Principal Designer services, including pre-construction information, construction phase plans, coordination of design risk assessments, and ongoing site safety management.',
    outcomes: [
      'Zero major incidents across 18-month build',
      'Successful HSE inspection with no enforcement action',
      'CDM 2015 full compliance achieved',
      '47% reduction in reportable incidents vs industry average',
    ],
    metrics: [
      { label: 'Project Value', value: '£120M' },
      { label: 'Duration', value: '18 months' },
      { label: 'Workforce', value: '300+ workers' },
    ],
  },
  {
    id: 'manufacturing-midlands',
    industry: 'Manufacturing',
    icon: Factory,
    client: 'Automotive Parts Manufacturer',
    title: 'ISO 45001 Certification for Manufacturing Facility',
    challenge:
      'A Midlands-based automotive parts manufacturer needed ISO 45001 certification to meet supply chain requirements and improve safety performance following several serious incidents.',
    solution:
      'We conducted a comprehensive gap analysis, designed a tailored Occupational Health & Safety Management System, provided implementation support, and delivered staff training programs.',
    outcomes: [
      'ISO 45001:2018 certification achieved',
      '68% reduction in lost-time injuries in first year',
      'Improved employee engagement in safety culture',
      'Major client contract secured based on certification',
    ],
    metrics: [
      { label: 'Certification', value: 'ISO 45001' },
      { label: 'Implementation', value: '6 months' },
      { label: 'LTI Reduction', value: '68%' },
    ],
  },
  {
    id: 'healthcare-trust',
    industry: 'Healthcare',
    icon: Heart,
    client: 'NHS Foundation Trust',
    title: 'Comprehensive COSHH Management for Multi-Site Trust',
    challenge:
      'An NHS Trust operating across five hospital sites required a unified approach to chemical safety management, COSHH compliance, and infection prevention protocols.',
    solution:
      'We delivered organisation-wide COSHH assessments, developed centralised control measures, implemented chemical inventory systems, and trained over 400 clinical and non-clinical staff.',
    outcomes: [
      'Full COSHH compliance across all five sites',
      'Centralised chemical management system implemented',
      'Staff training program delivered to 400+ employees',
      'CQC inspection passed with "Outstanding" safety rating',
    ],
    metrics: [
      { label: 'Sites Covered', value: '5 hospitals' },
      { label: 'Staff Trained', value: '400+' },
      { label: 'CQC Rating', value: 'Outstanding' },
    ],
  },
  {
    id: 'oil-gas-offshore',
    industry: 'Oil & Gas',
    icon: Droplet,
    client: 'North Sea Platform Operator',
    title: 'Process Safety Management for Offshore Installation',
    challenge:
      'An offshore oil platform required a comprehensive process safety management review following regulatory changes and aging infrastructure concerns.',
    solution:
      'CKBHSE consultants conducted Major Accident Hazard analysis, updated Permit-to-Work systems, delivered high-risk training, and implemented emergency response improvements.',
    outcomes: [
      'Full compliance with Offshore Installations Regulations',
      'Updated Safety Case accepted by HSE',
      'Emergency response capability significantly enhanced',
      'Zero major incidents in 24 months post-implementation',
    ],
    metrics: [
      { label: 'Hazards Assessed', value: '120+' },
      { label: 'Compliance', value: '100%' },
      { label: 'Incident-Free', value: '24 months' },
    ],
  },
];

export default function CaseStudies() {
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
              Case Studies
            </h1>
            <p className="text-xl opacity-90 leading-relaxed">
              Real-world success stories demonstrating measurable safety
              improvements, compliance achievements, and operational excellence
              across industries.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="space-y-12">
            {caseStudies.map((study) => (
              <motion.article
                key={study.id}
                variants={staggerItem}
                className="bg-card border border-card-border rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <div className="grid lg:grid-cols-3 gap-8 p-8 lg:p-10">
                  {/* Left Column - Header & Metrics */}
                  <div className="lg:col-span-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <study.icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge variant="outline">{study.industry}</Badge>
                    </div>
                    <h3 className="font-display font-bold text-2xl text-foreground mb-2">
                      {study.client}
                    </h3>
                    <p className="text-muted-foreground mb-6">{study.title}</p>

                    {/* Metrics */}
                    <div className="space-y-3">
                      {study.metrics.map((metric, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        >
                          <span className="text-sm text-muted-foreground">
                            {metric.label}
                          </span>
                          <span className="font-display font-bold text-primary">
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column - Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Challenge */}
                    <div>
                      <h4 className="font-display font-semibold text-lg text-foreground mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-destructive rounded-full" />
                        Challenge
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {study.challenge}
                      </p>
                    </div>

                    {/* Solution */}
                    <div>
                      <h4 className="font-display font-semibold text-lg text-foreground mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent rounded-full" />
                        Solution
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {study.solution}
                      </p>
                    </div>

                    {/* Outcomes */}
                    <div>
                      <h4 className="font-display font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Outcomes
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {study.outcomes.map((outcome, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground">
                              {outcome}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6">
            Ready to Achieve Similar Results?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Let's discuss how CKBHSE Limited can help your organisation improve
            safety performance, achieve compliance, and create lasting value.
          </p>
          <Link href="/contact" data-testid="button-discuss-project">
            <Button size="lg" className="font-semibold group">
              Discuss Your Project
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
