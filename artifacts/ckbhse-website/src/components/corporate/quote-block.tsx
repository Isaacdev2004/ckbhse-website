interface QuoteBlockProps {
  text: string;
  attribution?: string | undefined;
}

export function QuoteBlock({ text, attribution }: QuoteBlockProps) {
  return (
    <figure className="border-l-4 border-primary pl-6 py-2 my-4">
      <blockquote className="font-display text-2xl md:text-3xl text-foreground leading-snug italic">
        &ldquo;{text}&rdquo;
      </blockquote>
      {attribution && (
        <figcaption className="mt-4 text-sm text-muted-foreground">
          — {attribution}
        </figcaption>
      )}
    </figure>
  );
}
