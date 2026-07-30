import { Star } from 'lucide-react';
import { Link } from 'wouter';
import type { TestimonialPageContent } from '@workspace/content/schemas';

interface TestimonialCardProps {
  testimonial: TestimonialPageContent;
  compact?: boolean;
}

export function TestimonialCard({
  testimonial,
  compact = false,
}: TestimonialCardProps) {
  return (
    <blockquote className="bg-card border border-card-border rounded-xl p-6 h-full flex flex-col">
      <div className="flex gap-1 mb-4" aria-label={`${testimonial.rating} out of 5 stars`}>
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-primary text-primary" aria-hidden />
        ))}
      </div>
      <p className={`text-foreground leading-relaxed flex-1 ${compact ? 'text-sm' : ''}`}>
        &ldquo;{testimonial.testimonial}&rdquo;
      </p>
      <footer className="mt-4 pt-4 border-t border-border">
        <p className="font-semibold text-foreground">{testimonial.clientName}</p>
        <p className="text-sm text-muted-foreground">
          {testimonial.role}, {testimonial.company}
        </p>
        {!compact && (
          <Link
            href={testimonial.path}
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            Read full testimonial
          </Link>
        )}
      </footer>
    </blockquote>
  );
}
