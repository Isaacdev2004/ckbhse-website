import { Link } from 'wouter';
import { contentLoader } from '@/lib/content';
import { TRAINING_CATEGORY_LABELS } from '@workspace/content/schemas';

interface CourseNavigationProps {
  activeCategory: string;
  activeSlug: string;
}

export function CourseNavigation({
  activeCategory,
  activeSlug,
}: CourseNavigationProps) {
  const pages = contentLoader.getCoursePages();
  const hub = contentLoader.getTrainingHubPage();

  return (
    <nav aria-label="Training courses" className="space-y-6">
      {hub.categories.map((category) => {
        const categoryPages = pages.filter((p) => p.category === category.id);
        if (categoryPages.length === 0) return null;

        return (
          <div key={category.id}>
            <Link
              href={`/training?category=${category.id}`}
              className="font-display font-semibold text-sm uppercase tracking-wide text-foreground hover:text-primary transition-colors"
            >
              {category.label}
            </Link>
            <ul className="mt-2 space-y-1">
              {categoryPages.map((course) => {
                const isActive =
                  course.category === activeCategory &&
                  course.slug === activeSlug;
                return (
                  <li key={course.path}>
                    <Link
                      href={course.path}
                      aria-current={isActive ? 'page' : undefined}
                      className={`block text-sm py-1.5 px-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {course.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground pt-2 border-t border-border">
        {hub.categories.length} categories · {pages.length} courses
      </p>
    </nav>
  );
}

export { TRAINING_CATEGORY_LABELS };
