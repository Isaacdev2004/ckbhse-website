import type { LegalPageContent } from '@workspace/content/schemas';
import { PageShell } from '@/components/page-shell';
import { PageContainer } from '@/components/page-container';

interface LegalPageViewProps {
  content: LegalPageContent;
  path: string;
}

function sectionId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function LegalPageView({ content, path }: LegalPageViewProps) {
  return (
    <PageShell seo={content.seo} path={path}>
      <section className="py-24 bg-background">
        <PageContainer variant="narrow">
          <h1
            id="page-title"
            tabIndex={-1}
            className="font-display font-bold text-5xl text-foreground mb-4 outline-none"
          >
            {content.title}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: {content.lastUpdated}
          </p>
          {content.intro && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              {content.intro}
            </p>
          )}
          <div className="space-y-12">
            {content.sections.map((section) => {
              const id = sectionId(section.title);
              return (
                <section key={section.title} aria-labelledby={id}>
                  <h2
                    id={id}
                    className="font-display font-bold text-2xl text-foreground mb-4"
                  >
                    {section.title}
                  </h2>
                  <div className="space-y-4">
                    {section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 48)}
                        className="text-muted-foreground leading-relaxed text-lg"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {section.items && section.items.length > 0 && (
                    <ul className="mt-4 space-y-2 list-disc list-inside text-muted-foreground text-lg leading-relaxed">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        </PageContainer>
      </section>
    </PageShell>
  );
}
