import { motion } from 'framer-motion';
import {
  GraduationCap,
  Award,
  Clock,
  Users,
  BookOpen,
  Video,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  SectionReveal,
  StaggerContainer,
  staggerItem,
} from '@/components/section-reveal';

const courses = [
  {
    id: 'iosh-managing-safely',
    title: 'IOSH Managing Safely',
    accreditation: 'IOSH Accredited',
    level: 'Management',
    duration: '3-4 days',
    format: ['Classroom', 'Online'],
    description:
      'Industry-leading health and safety course for managers and supervisors across all sectors.',
    outcomes: [
      'Understand legal responsibilities',
      'Identify and control risks',
      'Investigate incidents effectively',
      'Improve safety culture',
    ],
    price: 'From £395',
  },
  {
    id: 'nebosh-general-certificate',
    title: 'NEBOSH General Certificate',
    accreditation: 'NEBOSH Accredited',
    level: 'Professional',
    duration: '10 days',
    format: ['Classroom', 'Online'],
    description:
      'Gold standard health and safety qualification recognised globally.',
    outcomes: [
      'Professional H&S qualification',
      'Risk assessment expertise',
      'Legal knowledge',
      'Career progression',
    ],
    price: 'From £1,295',
  },
  {
    id: 'fire-warden',
    title: 'Fire Warden Training',
    accreditation: 'CPD Certified',
    level: 'Operational',
    duration: 'Half day',
    format: ['On-site', 'Classroom'],
    description:
      'Equip designated fire wardens with the knowledge and skills to manage fire emergencies.',
    outcomes: [
      'Fire safety legislation',
      'Evacuation procedures',
      'Fire equipment use',
      'Emergency response',
    ],
    price: 'From £95',
  },
  {
    id: 'first-aid-at-work',
    title: 'First Aid at Work',
    accreditation: 'HSE Approved',
    level: 'Operational',
    duration: '3 days',
    format: ['On-site', 'Classroom'],
    description:
      'Comprehensive first aid training to meet workplace emergency requirements.',
    outcomes: [
      'Emergency response skills',
      'CPR and AED use',
      'Injury and illness management',
      'HSE compliance',
    ],
    price: 'From £295',
  },
  {
    id: 'manual-handling',
    title: 'Manual Handling Awareness',
    accreditation: 'CPD Certified',
    level: 'Operational',
    duration: '2 hours',
    format: ['On-site', 'Online'],
    description:
      'Practical training to reduce musculoskeletal injuries and improve lifting techniques.',
    outcomes: [
      'Safe lifting techniques',
      'Risk identification',
      'Injury prevention',
      'Legal requirements',
    ],
    price: 'From £45',
  },
  {
    id: 'coshh-awareness',
    title: 'COSHH Awareness',
    accreditation: 'CPD Certified',
    level: 'Operational',
    duration: '2 hours',
    format: ['Online', 'Classroom'],
    description:
      'Control of Substances Hazardous to Health training for safe chemical handling.',
    outcomes: [
      'COSHH regulations',
      'Hazard identification',
      'Control measures',
      'Safe chemical handling',
    ],
    price: 'From £55',
  },
  {
    id: 'working-at-height',
    title: 'Working at Height',
    accreditation: 'CPD Certified',
    level: 'Operational',
    duration: 'Half day',
    format: ['On-site', 'Classroom'],
    description:
      'Essential training for anyone working at height or managing such activities.',
    outcomes: [
      'Height safety legislation',
      'Fall prevention',
      'Equipment selection',
      'Rescue procedures',
    ],
    price: 'From £85',
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment Training',
    accreditation: 'CPD Certified',
    level: 'Management',
    duration: '1 day',
    format: ['Classroom', 'Online'],
    description:
      'Practical skills to conduct effective workplace risk assessments.',
    outcomes: [
      'Risk assessment methodology',
      'Hazard identification',
      'Control hierarchy',
      'Documentation',
    ],
    price: 'From £195',
  },
];

export default function Training() {
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
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Accredited Training Provider
              </span>
            </div>
            <h1 className="font-display font-bold text-5xl md:text-6xl mb-6">
              Safety Training Courses
            </h1>
            <p className="text-xl opacity-90 leading-relaxed">
              IOSH, NEBOSH, and specialist health and safety training delivered
              by qualified professionals. Classroom, online, and on-site options
              available.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Training Benefits */}
      <SectionReveal className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-card-border rounded-xl p-6 text-center">
              <Award className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                Accredited Courses
              </h3>
              <p className="text-sm text-muted-foreground">
                IOSH, NEBOSH, HSE approved qualifications
              </p>
            </div>
            <div className="bg-card border border-card-border rounded-xl p-6 text-center">
              <Users className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                Expert Trainers
              </h3>
              <p className="text-sm text-muted-foreground">
                Delivered by qualified safety professionals
              </p>
            </div>
            <div className="bg-card border border-card-border rounded-xl p-6 text-center">
              <BookOpen className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                Flexible Delivery
              </h3>
              <p className="text-sm text-muted-foreground">
                Classroom, online, and on-site options
              </p>
            </div>
            <div className="bg-card border border-card-border rounded-xl p-6 text-center">
              <Video className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                Digital Resources
              </h3>
              <p className="text-sm text-muted-foreground">
                Course materials and certificates online
              </p>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* Courses Grid */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">
              Available Courses
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From foundation awareness to professional qualifications, we offer
              training to suit every level.
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                variants={staggerItem}
                className="bg-card border border-card-border rounded-xl p-6 hover:shadow-xl hover:border-primary/50 transition-all"
              >
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-display font-semibold text-xl text-foreground">
                      {course.title}
                    </h3>
                    <Badge variant="secondary" className="whitespace-nowrap">
                      {course.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Award className="w-3 h-3 mr-1" />
                      {course.accreditation}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {course.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {course.format.join(' / ')}
                    </span>
                  </div>
                </div>

                {/* Outcomes */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    What You'll Learn
                  </h4>
                  <ul className="space-y-1">
                    {course.outcomes.map((outcome, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="font-display font-bold text-lg text-primary">
                    {course.price}
                  </span>
                  <Link
                    href="/contact"
                    data-testid={`button-book-${course.id}`}
                  >
                    <Button variant="outline" size="sm" className="group">
                      Book Now
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Corporate Training CTA */}
      <SectionReveal className="py-24 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-6">
            Corporate Training Solutions
          </h2>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Need to train multiple employees? We offer bespoke on-site training,
            group discounts, and tailored programs for organisations.
          </p>
          <Link href="/contact" data-testid="button-corporate-training">
            <Button
              size="lg"
              variant="secondary"
              className="font-semibold group"
            >
              Enquire About Corporate Training
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </SectionReveal>
    </div>
  );
}
