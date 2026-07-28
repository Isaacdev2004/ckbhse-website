import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  delay?: number;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-card border border-card-border rounded-xl p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <div className="font-display font-bold text-3xl text-foreground mb-1">
            {value}
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {label}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
