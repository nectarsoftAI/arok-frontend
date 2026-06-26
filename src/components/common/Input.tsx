import { type InputHTMLAttributes } from 'react';
import { cn } from './utils';

type InputVariant = 'default' | 'filled';
type InputSize = 'sm' | 'md';

const variantClasses: Record<InputVariant, string> = {
  default: 'bg-white border border-[#E5E7EB]',
  filled:  'bg-[#F3F4F6] border border-[#E5E7EB]',
};

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-4 py-2',
  md: 'px-4 py-2.5',
};

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
}

export function Input({ variant = 'default', size = 'md', className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FF5] focus:border-transparent',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
