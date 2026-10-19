import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'white'
    | 'amber';
  size?: 'default' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'icon-sm';
  loading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      loading = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles: Record<string, string> = {
      default:
        'bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 shadow-sm font-semibold',
      primary:
        'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold hover:from-amber-400 hover:to-amber-500 shadow-sm active:scale-95',
      amber:
        'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold hover:from-amber-400 hover:to-amber-500 shadow-sm active:scale-95',
      white:
        'bg-white text-zinc-950 hover:bg-zinc-100 shadow-sm active:scale-95 font-semibold',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 active:scale-95 font-medium shadow-sm',
      outline:
        'border border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800/80 hover:border-zinc-600 active:scale-95 font-medium',
      secondary:
        'bg-zinc-900 border border-zinc-800 text-zinc-100 hover:bg-zinc-800 active:scale-95 font-medium shadow-sm',
      ghost:
        'bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 active:scale-95 font-medium',
      link:
        'text-amber-500 underline-offset-4 hover:underline p-0 h-auto font-medium',
    };

    const sizeStyles: Record<string, string> = {
      xs: 'h-7 px-2.5 text-[10px] font-mono uppercase tracking-wider',
      sm: 'h-8 px-3 text-xs font-mono uppercase tracking-wider',
      md: 'h-9 px-4 text-xs font-mono uppercase tracking-wider',
      default: 'h-9 px-4 text-xs font-mono uppercase tracking-wider',
      lg: 'h-11 px-6 text-sm font-mono uppercase tracking-wider',
      xl: 'h-13 px-8 text-base font-mono uppercase tracking-wider',
      icon: 'h-9 w-9 p-0 flex items-center justify-center flex-shrink-0',
      'icon-sm': 'h-7 w-7 p-0 flex items-center justify-center flex-shrink-0',
    };

    const resolvedVariant = variantStyles[variant] || variantStyles.default;
    const resolvedSize = sizeStyles[size] || sizeStyles.default;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-mono transition-all duration-150 outline-none select-none',
          'focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
          resolvedVariant,
          resolvedSize,
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
