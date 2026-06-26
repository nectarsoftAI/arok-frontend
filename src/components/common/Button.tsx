import { type ButtonHTMLAttributes } from 'react';
import { cn } from '../ui/utils';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'dark' | 'outline' | 'hero';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-[#5B5FF5] hover:bg-[#5B5FF5]/90 text-white',
  secondary: 'border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]',
  danger:    'bg-red-500 hover:bg-red-600 text-white',
  dark:      'bg-[#1A1D2E] hover:bg-[#1A1D2E]/90 text-white',
  outline:   'border border-[#5B5FF5] text-[#5B5FF5] hover:bg-[#5B5FF5] hover:text-white',
  hero:      'bg-gradient-to-br from-[#5B5FF5] to-[#818CF8] hover:from-[#5B5FF5]/90 hover:to-[#818CF8]/90 text-white shadow-lg hover:shadow-xl hover:scale-105 rounded-xl',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-8 py-4 text-lg',
};

const DISABLED_CLASSES = 'bg-gray-200 text-gray-400 cursor-not-allowed border-transparent hover:scale-100';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'rounded-lg font-medium transition-all',
        disabled ? DISABLED_CLASSES : variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
