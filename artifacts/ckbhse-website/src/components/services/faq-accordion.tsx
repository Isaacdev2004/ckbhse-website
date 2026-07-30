import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion';
import type { FaqItem } from '@workspace/content/schemas';

interface FaqAccordionProps {
  title?: string;
  items: FaqItem[];
}

export function FaqAccordion({
  title = 'Frequently asked questions',
  items,
}: FaqAccordionProps) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="faq-heading">
      <h2
        id="faq-heading"
        className="font-display font-bold text-3xl md:text-4xl text-foreground mb-8"
      >
        {title}
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {items.map((item, index) => (
          <AccordionItem key={item.question} value={`faq-${index}`}>
            <AccordionTrigger className="text-left text-base font-medium">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
