import { motion } from 'framer-motion';
import { BookOpen, Clock, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StaggerContainer, staggerItem } from '@/components/section-reveal';

const articles = [
  {
    id: 'understanding-cdm-2015',
    title: 'Understanding CDM 2015: A Guide for Construction Clients',
    category: 'Construction',
    excerpt:
      'The Construction (Design and Management) Regulations 2015 place critical duties on clients, designers, and contractors. Learn what compliance really means.',
    author: 'Sarah Mitchell',
    readTime: '8 min read',
    date: 'March 15, 2024',
    featured: true,
  },
  {
    id: 'iso-45001-implementation',
    title: 'ISO 45001:2018 Implementation: A Step-by-Step Roadmap',
    category: 'ISO Compliance',
    excerpt:
      'Practical guidance on transitioning to or implementing ISO 45001, the international standard for occupational health and safety management systems.',
    author: 'Dr. James Parker',
    readTime: '10 min read',
    date: 'March 10, 2024',
    featured: true,
  },
  {
    id: 'workplace-mental-health',
    title: 'Managing Workplace Mental Health: Legal Duties and Best Practice',
    category: 'Wellbeing',
    excerpt:
      'Mental health is a critical component of workplace safety. Explore employer obligations under HSE guidance and practical support strategies.',
    author: 'Emma Richardson',
    readTime: '6 min read',
    date: 'March 5, 2024',
    featured: false,
  },
  {
    id: 'fire-risk-assessment-guide',
    title: 'Fire Risk Assessment: Meeting Your Legal Obligations',
    category: 'Fire Safety',
    excerpt:
      'A comprehensive guide to conducting fire risk assessments under the Regulatory Reform (Fire Safety) Order 2005.',
    author: 'Michael Chen',
    readTime: '7 min read',
    date: 'February 28, 2024',
    featured: false,
  },
  {
    id: 'coshh-assessments-explained',
    title:
      'COSHH Assessments Explained: Protecting Workers from Chemical Hazards',
    category: 'Chemical Safety',
    excerpt:
      'Step-by-step guidance on conducting Control of Substances Hazardous to Health assessments and implementing effective control measures.',
    author: 'Sarah Mitchell',
    readTime: '9 min read',
    date: 'February 22, 2024',
    featured: false,
  },
  {
    id: 'incident-investigation-techniques',
    title: 'Incident Investigation Techniques: Root Cause Analysis in Practice',
    category: 'Safety Management',
    excerpt:
      'Learn proven investigation methodologies to identify underlying causes and prevent future workplace incidents.',
    author: 'Dr. James Parker',
    readTime: '11 min read',
    date: 'February 15, 2024',
    featured: false,
  },
  {
    id: 'environmental-compliance-manufacturing',
    title: 'Environmental Compliance for Manufacturing: Beyond ISO 14001',
    category: 'Environmental',
    excerpt:
      'Navigate the complex landscape of environmental regulations affecting UK manufacturing operations, from emissions to waste management.',
    author: 'Emma Richardson',
    readTime: '8 min read',
    date: 'February 8, 2024',
    featured: false,
  },
  {
    id: 'health-surveillance-guide',
    title: 'When is Health Surveillance Required? A Practical Guide',
    category: 'Occupational Health',
    excerpt:
      'Understanding legal requirements and best practices for implementing health surveillance programs in high-risk industries.',
    author: 'Michael Chen',
    readTime: '7 min read',
    date: 'February 1, 2024',
    featured: false,
  },
];

const categories = [
  'All',
  'Construction',
  'ISO Compliance',
  'Fire Safety',
  'Chemical Safety',
  'Safety Management',
  'Environmental',
  'Wellbeing',
  'Occupational Health',
];

export default function Knowledge() {
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
              Knowledge Hub
            </h1>
            <p className="text-xl opacity-90 leading-relaxed mb-8">
              Expert insights, regulatory updates, and practical guidance on
              health, safety, environment, and quality management.
            </p>

            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search articles..."
                className="pl-12 h-12 bg-secondary-foreground/10 border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/50"
                data-testid="input-search-articles"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <div className="bg-background border-b border-border sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-4 no-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Articles */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-3xl text-foreground mb-8">
            Featured Articles
          </h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {articles
              .filter((a) => a.featured)
              .map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card border border-card-border rounded-xl overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all group"
                >
                  <div className="p-8">
                    <Badge className="mb-4">{article.category}</Badge>
                    <h3 className="font-display font-bold text-2xl text-foreground mb-3 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{article.author}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {article.readTime}
                        </span>
                      </div>
                      <span>{article.date}</span>
                    </div>
                  </div>
                  <div className="px-8 pb-8">
                    <Button
                      variant="outline"
                      className="w-full group"
                      data-testid={`button-read-${article.id}`}
                    >
                      Read Article
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.article>
              ))}
          </div>
        </div>
      </section>

      {/* All Articles */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-3xl text-foreground mb-8">
            Latest Articles
          </h2>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles
              .filter((a) => !a.featured)
              .map((article) => (
                <motion.article
                  key={article.id}
                  variants={staggerItem}
                  className="bg-card border border-card-border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all group"
                >
                  <Badge variant="outline" className="mb-3">
                    {article.category}
                  </Badge>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span>{article.author}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full group"
                    data-testid={`button-read-${article.id}`}
                  >
                    Read More
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.article>
              ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-6">
            Stay Informed
          </h2>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Subscribe to receive expert HSEQ insights, regulatory updates, and
            best practice guidance directly to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-12 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
              data-testid="input-newsletter-email"
            />
            <Button
              size="lg"
              variant="secondary"
              className="font-semibold whitespace-nowrap"
              data-testid="button-subscribe"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
