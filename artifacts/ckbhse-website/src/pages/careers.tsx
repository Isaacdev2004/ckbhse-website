import { motion } from 'framer-motion';
import { Users, Heart, TrendingUp, GraduationCap, MapPin, Clock, Briefcase, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SectionReveal, StaggerContainer, staggerItem } from '@/components/section-reveal';

const benefits = [
  {
    icon: Heart,
    title: 'Health & Wellbeing',
    description: 'Comprehensive health insurance, mental health support, and wellbeing programs.',
  },
  {
    icon: TrendingUp,
    title: 'Career Development',
    description: 'Professional development support, accreditation funding, and clear progression paths.',
  },
  {
    icon: GraduationCap,
    title: 'Learning & Training',
    description: 'Access to industry training, conference attendance, and continuous learning opportunities.',
  },
  {
    icon: Users,
    title: 'Collaborative Culture',
    description: 'Work with expert colleagues in a supportive, professional environment.',
  },
];

const openPositions = [
  {
    id: 'senior-hseq-consultant',
    title: 'Senior HSEQ Consultant',
    location: 'London / Hybrid',
    type: 'Full-time',
    salary: '£45,000 - £60,000',
    description: 'Lead client consultancy projects across multiple sectors, conduct audits, deliver training, and support business development.',
    requirements: [
      'NEBOSH Diploma or equivalent',
      'Minimum 5 years HSEQ consultancy experience',
      'ISO 45001 lead auditor qualification preferred',
      'Strong client-facing and communication skills',
    ],
  },
  {
    id: 'hseq-consultant',
    title: 'HSEQ Consultant',
    location: 'Manchester / Hybrid',
    type: 'Full-time',
    salary: '£35,000 - £45,000',
    description: 'Deliver consultancy services including risk assessments, audits, compliance advice, and training to clients across construction and manufacturing sectors.',
    requirements: [
      'NEBOSH General Certificate minimum',
      '2-4 years HSEQ experience',
      'Experience in construction or manufacturing preferred',
      'Full UK driving licence',
    ],
  },
  {
    id: 'training-consultant',
    title: 'Training Consultant',
    location: 'Birmingham / Hybrid',
    type: 'Full-time',
    salary: '£32,000 - £42,000',
    description: 'Deliver accredited health and safety training courses (IOSH, NEBOSH, and specialist programs) to corporate clients.',
    requirements: [
      'NEBOSH qualification and relevant teaching certifications',
      'Proven training delivery experience',
      'Ability to engage diverse audiences',
      'Willingness to travel to client sites',
    ],
  },
  {
    id: 'graduate-consultant',
    title: 'Graduate HSEQ Consultant',
    location: 'London',
    type: 'Full-time',
    salary: '£26,000 - £30,000',
    description: 'Join our team as a graduate consultant and develop your HSEQ expertise through structured mentoring, client projects, and professional qualifications.',
    requirements: [
      'Degree in relevant field (Health & Safety, Environmental Science, Engineering)',
      'NEBOSH General Certificate desirable',
      'Strong analytical and communication skills',
      'Eagerness to learn and develop professionally',
    ],
  },
];

export default function Careers() {
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
              Join Our Team
            </h1>
            <p className="text-xl opacity-90 leading-relaxed">
              Build a rewarding career in HSEQ consultancy. Work with industry experts, solve complex challenges, and make workplaces safer.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Join Us */}
      <SectionReveal className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">
              Why Work at CKBHSE?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We invest in our people and create an environment where expertise, collaboration, and professional growth thrive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border border-card-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* Open Positions */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">
              Open Positions
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Explore current opportunities to join our growing consultancy team.
            </p>
          </div>

          <StaggerContainer className="space-y-6">
            {openPositions.map((position) => (
              <motion.div
                key={position.id}
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
                      <h4 className="font-semibold text-sm text-foreground mb-2">Key Requirements:</h4>
                      <ul className="space-y-1">
                        {position.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="lg:w-48">
                    <Link href="/contact" data-testid={`button-apply-${position.id}`}>
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
        </div>
      </section>

      {/* General Application */}
      <SectionReveal className="py-24 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-6">
            Don't See the Right Role?
          </h2>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            We're always interested in hearing from talented HSEQ professionals. Submit a general application and we'll keep you in mind for future opportunities.
          </p>
          <Link href="/contact" data-testid="button-general-application">
            <Button size="lg" variant="secondary" className="font-semibold group">
              Submit General Application
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </SectionReveal>
    </div>
  );
}
