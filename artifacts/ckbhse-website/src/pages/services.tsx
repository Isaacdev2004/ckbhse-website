import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, FileCheck, Award, Flame, Leaf, Eye, FlaskConical, AlertCircle, ClipboardList, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { SectionReveal, StaggerContainer, staggerItem } from '@/components/section-reveal';

const serviceCategories = [
  { id: 'all', label: 'All Services' },
  { id: 'compliance', label: 'Compliance & Audits' },
  { id: 'management', label: 'Safety Management' },
  { id: 'environmental', label: 'Environmental' },
  { id: 'specialist', label: 'Specialist Services' },
];

const services = [
  {
    id: 'health-safety-audits',
    icon: Shield,
    title: 'Health & Safety Audits',
    category: 'compliance',
    description: 'Comprehensive workplace audits to assess compliance with UK HSE regulations, identify hazards, and provide actionable improvement plans.',
    features: ['Site inspections', 'Compliance gap analysis', 'HSE regulation review', 'Detailed audit reports', 'Remediation planning'],
  },
  {
    id: 'risk-assessments',
    icon: FileCheck,
    title: 'Risk Assessments & Method Statements',
    category: 'management',
    description: 'Detailed risk analysis and method statements (RAMS) tailored to your operations, industry, and specific tasks.',
    features: ['Workplace risk assessments', 'Task-specific RAMS', 'COSHH assessments', 'Manual handling assessments', 'Display screen equipment (DSE)'],
  },
  {
    id: 'iso-compliance',
    icon: Award,
    title: 'ISO Compliance & Certification',
    category: 'compliance',
    description: 'Expert guidance for achieving and maintaining ISO 9001 (Quality), ISO 14001 (Environmental), and ISO 45001 (Health & Safety) certification.',
    features: ['ISO gap analysis', 'Implementation support', 'Documentation development', 'Internal audits', 'Certification preparation'],
  },
  {
    id: 'fire-safety',
    icon: Flame,
    title: 'Fire Safety Management',
    category: 'specialist',
    description: 'Fire risk assessments, evacuation planning, and compliance with the Regulatory Reform (Fire Safety) Order 2005.',
    features: ['Fire risk assessments', 'Emergency evacuation plans', 'Fire warden training', 'Fire safety equipment audits', 'Compliance documentation'],
  },
  {
    id: 'environmental',
    icon: Leaf,
    title: 'Environmental Management',
    category: 'environmental',
    description: 'Environmental impact assessments, waste management planning, and sustainability consulting to meet regulatory obligations.',
    features: ['Environmental audits', 'Waste management plans', 'Carbon footprint analysis', 'Regulatory compliance', 'Sustainability strategies'],
  },
  {
    id: 'workplace-inspections',
    icon: Eye,
    title: 'Workplace Inspections',
    category: 'management',
    description: 'Regular site inspections to identify hazards, monitor safety performance, and ensure ongoing compliance.',
    features: ['Scheduled site visits', 'Hazard identification', 'Equipment checks', 'PPE compliance', 'Inspection reporting'],
  },
  {
    id: 'coshh',
    icon: FlaskConical,
    title: 'COSHH Assessments',
    category: 'specialist',
    description: 'Control of Substances Hazardous to Health (COSHH) assessments to manage chemical risks and ensure safe handling procedures.',
    features: ['Chemical risk assessment', 'Exposure monitoring', 'Control measures', 'Training recommendations', 'SDS review'],
  },
  {
    id: 'incident-investigation',
    icon: AlertCircle,
    title: 'Incident Investigation',
    category: 'management',
    description: 'Professional investigation of workplace accidents and near-misses with root cause analysis and corrective action plans.',
    features: ['Accident investigation', 'Root cause analysis', 'RIDDOR reporting', 'Corrective action plans', 'Prevention strategies'],
  },
  {
    id: 'safety-management-systems',
    icon: ClipboardList,
    title: 'Safety Management Systems',
    category: 'management',
    description: 'Development and implementation of comprehensive safety management systems tailored to your organisation.',
    features: ['SMS design & development', 'Policy creation', 'Procedure documentation', 'Performance monitoring', 'Continuous improvement'],
  },
];

export default function Services() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredServices = activeCategory === 'all'
    ? services
    : services.filter(service => service.category === activeCategory);

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
              HSEQ Consultancy Services
            </h1>
            <p className="text-xl opacity-90 leading-relaxed">
              Comprehensive health, safety, environment, and quality consulting services designed to keep your business compliant, your people safe, and your operations running smoothly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <div className="bg-background border-b border-border sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-4 no-scrollbar">
            {serviceCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-5 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                data-testid={`button-filter-${category.id}`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredServices.map((service) => (
              <motion.div
                key={service.id}
                variants={staggerItem}
                id={service.id}
                className="bg-card border border-card-border rounded-xl p-8 hover:shadow-xl hover:border-primary/50 transition-all"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-2xl text-foreground mb-2">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href="/contact" data-testid={`button-enquire-${service.id}`}>
                  <Button variant="outline" className="w-full group">
                    Enquire About This Service
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Retainer CTA */}
      <SectionReveal className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6">
            Need Ongoing HSEQ Support?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Our retainer packages provide dedicated consultancy support, regular site visits, compliance monitoring, and priority access to our team.
          </p>
          <Link href="/contact" data-testid="button-discuss-retainer">
            <Button size="lg" className="font-semibold group">
              Discuss Retainer Options
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </SectionReveal>
    </div>
  );
}
