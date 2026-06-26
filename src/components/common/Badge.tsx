import { cn } from '../ui/utils';

type BadgeVariant = 'primary' | 'neutral' | 'warning';
type BadgeSize = 'sm' | 'md';

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-[#EEF2FF] text-[#5B5FF5]',
  neutral: 'bg-[#F3F4F6] text-[#6B7280]',
  warning: 'bg-[#FEF3C7] text-[#92400E]',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 rounded',
  md: 'px-3 py-1 rounded-md',
};

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'neutral', size = 'sm', children, className }: BadgeProps) {
  return (
    <span className={cn('text-xs', variantClasses[variant], sizeClasses[size], className)}>
      {children}
    </span>
  );
}
