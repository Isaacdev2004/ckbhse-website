import type { ContentBlock } from '@workspace/content/schemas';

export function ResourceBody({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p
                key={index}
                className="text-lg text-muted-foreground leading-relaxed"
              >
                {block.text}
              </p>
            );
          case 'heading':
            if (block.level === '2') {
              return (
                <h2
                  key={index}
                  className="font-display font-bold text-2xl text-foreground mt-8 mb-4"
                >
                  {block.text}
                </h2>
              );
            }
            return (
              <h3
                key={index}
                className="font-display font-semibold text-xl text-foreground mt-6 mb-3"
              >
                {block.text}
              </h3>
            );
          case 'list':
            if (block.ordered) {
              return (
                <ol
                  key={index}
                  className="list-decimal list-inside space-y-2 text-muted-foreground"
                >
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              );
            }
            return (
              <ul
                key={index}
                className="list-disc list-inside space-y-2 text-muted-foreground"
              >
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
