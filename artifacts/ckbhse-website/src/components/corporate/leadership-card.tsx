import type { Leader } from '@workspace/content/schemas';

interface LeadershipCardProps {
  member: Leader;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function LeadershipCard({ member }: LeadershipCardProps) {
  return (
    <article
      className="bg-card border border-card-border rounded-xl p-6 hover:shadow-lg transition-all"
      aria-labelledby={`leader-${member.slug}`}
    >
      <div
        className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"
        aria-hidden="true"
      >
        <span className="font-display font-bold text-primary text-lg">
          {initials(member.name)}
        </span>
      </div>
      <h3
        id={`leader-${member.slug}`}
        className="font-display font-semibold text-lg text-foreground"
      >
        {member.name}
      </h3>
      <p className="text-sm text-primary font-medium mb-3">{member.role}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {member.bio}
      </p>
    </article>
  );
}
