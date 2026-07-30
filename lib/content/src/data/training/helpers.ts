import type {
  DeliveryMethodId,
  PathwayLevelId,
  TrainingCategoryId,
  CoursePageContent,
} from '../../schemas/training.js';
import {
  TRAINING_CATEGORY_LABELS,
  buildTrainingPath,
} from '../../schemas/training.js';

type ServiceRef = CoursePageContent['relatedServices'][number];
type IndustryRef = CoursePageContent['industries'][number];
type CourseRef = NonNullable<CoursePageContent['relatedCourses']>[number];

const DEFAULT_FAQS = [
  {
    question: 'How do I book this course?',
    answer:
      'Contact our training team via the enquiry form or call us directly. We will confirm availability, delivery format, and pricing for your requirements.',
  },
  {
    question: 'Can this course be delivered on-site for our team?',
    answer:
      'Yes. Most courses are available on-site, at our training venues, or via virtual instructor-led delivery for groups of four or more delegates.',
  },
  {
    question: 'Will I receive a certificate?',
    answer:
      'All delegates receive a CKBHSE certificate of attendance. Accredited programmes include the relevant awarding body certificate upon successful assessment.',
  },
];

export interface DefineCourseInput {
  slug: string;
  category: TrainingCategoryId;
  title: string;
  subtitle: string;
  icon: CoursePageContent['icon'];
  overview: string[];
  learningObjectives: string[];
  targetAudience: string[];
  prerequisites?: string[];
  deliveryMethodIds: DeliveryMethodId[];
  duration: string;
  certification: CoursePageContent['certification'];
  assessment: string;
  courseOutline: CoursePageContent['courseOutline'];
  learningOutcomes: string[];
  industrySlugs: string[];
  relatedServices?: ServiceRef[];
  relatedCourses?: CourseRef[];
  pathwayLevel?: PathwayLevelId;
  accreditation: string;
  level: PathwayLevelId;
  price: string;
  featured?: boolean;
  keywords?: string[];
  faqs?: CoursePageContent['faqs'];
}

function industryRef(slug: string): IndustryRef {
  const names: Record<string, string> = {
    construction: 'Construction',
    manufacturing: 'Manufacturing',
    logistics: 'Logistics & Transport',
    warehousing: 'Warehousing & Distribution',
    healthcare: 'Healthcare',
    education: 'Education',
    'oil-gas': 'Oil & Gas',
    'energy-utilities': 'Energy & Utilities',
    'food-beverage': 'Food & Beverage',
    retail: 'Retail & Commercial',
    'public-sector': 'Public Sector',
    'facilities-management': 'Facilities Management',
  };
  return { slug, name: names[slug] ?? slug };
}

function deliveryMethods(
  ids: DeliveryMethodId[],
): CoursePageContent['deliveryMethods'] {
  const descriptions: Record<DeliveryMethodId, string> = {
    classroom:
      'Face-to-face delivery at CKBHSE training venues with practical exercises.',
    online:
      'Self-paced e-learning with knowledge checks and downloadable resources.',
    'on-site':
      'Delivered at your premises, tailored to your workplace hazards and procedures.',
    'virtual-instructor-led':
      'Live online sessions with qualified trainers and interactive workshops.',
  };
  const labels: Record<DeliveryMethodId, string> = {
    classroom: 'Classroom',
    online: 'Online',
    'on-site': 'On-site',
    'virtual-instructor-led': 'Virtual Instructor-Led',
  };
  return ids.map((id) => ({
    id,
    label: labels[id],
    description: descriptions[id],
  }));
}

export function defineCourse(input: DefineCourseInput): CoursePageContent {
  const path = buildTrainingPath(input.category, input.slug);
  const categoryLabel = TRAINING_CATEGORY_LABELS[input.category];

  return {
    slug: input.slug,
    category: input.category,
    path,
    title: input.title,
    subtitle: input.subtitle,
    icon: input.icon,
    hero: {
      badge: input.accreditation,
      title: input.title,
      description: input.subtitle,
    },
    overview: input.overview,
    learningObjectives: input.learningObjectives,
    targetAudience: input.targetAudience,
    prerequisites: input.prerequisites ?? ['No formal prerequisites required'],
    deliveryMethods: deliveryMethods(input.deliveryMethodIds),
    duration: input.duration,
    certification: input.certification,
    assessment: input.assessment,
    courseOutline: input.courseOutline,
    learningOutcomes: input.learningOutcomes,
    industries: input.industrySlugs.map(industryRef),
    relatedServices: input.relatedServices ?? [],
    relatedIndustries: input.industrySlugs.map(industryRef),
    relatedCourses: input.relatedCourses,
    pathwayLevel: input.pathwayLevel ?? input.level,
    faqs: input.faqs ?? DEFAULT_FAQS,
    cta: {
      title: 'Enquire about this course',
      description:
        'Speak to our training team about dates, group bookings, and bespoke delivery options.',
      buttonLabel: 'Enquire Now',
      buttonHref: '/contact',
    },
    seo: {
      title: `${input.title} | CKBHSE Training`,
      description: input.subtitle,
    },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Training', href: '/training' },
      { label: categoryLabel, href: `/training?category=${input.category}` },
      { label: input.title, href: path },
    ],
    keywords: input.keywords,
    featured: input.featured,
    accreditation: input.accreditation,
    level: input.level,
    price: input.price,
  };
}

export function outline(
  module: string,
  topics: string[],
): CoursePageContent['courseOutline'][number] {
  return { module, topics };
}

export function serviceRef(
  category: ServiceRef['category'],
  slug: string,
): ServiceRef {
  return { category, slug };
}

export function courseRef(
  category: TrainingCategoryId,
  slug: string,
): CourseRef {
  return { category, slug };
}
