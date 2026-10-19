import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string | boolean;
  icon?: React.ReactNode;
  endAddon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      icon,
      endAddon,
      inputSize = 'md',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const sizeStyles = {
      sm: 'h-8 px-2.5 text-xs',
      md: 'h-9 px-3 text-xs',
      lg: 'h-11 px-3.5 text-sm',
    };

    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : undefined;

    return (
      <div className="w-full flex flex-col gap-1.5 font-mono">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-zinc-400 select-none flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-amber-500 text-xs">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3 flex items-center justify-center text-zinc-500 pointer-events-none">
              {icon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full bg-zinc-900 border text-zinc-100 placeholder:text-zinc-500 rounded-sm font-mono transition-all duration-150 outline-none',
              'border-zinc-800 hover:border-zinc-700',
              'focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30',
              'disabled:opacity-50 disabled:bg-zinc-950 disabled:cursor-not-allowed',
              sizeStyles[inputSize],
              icon && 'pl-9',
              endAddon && 'pr-9',
              hasError && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30',
              className
            )}
            {...props}
          />

          {endAddon && (
            <div className="absolute right-3 flex items-center justify-center text-zinc-500">
              {endAddon}
            </div>
          )}
        </div>

        {errorMessage && (
          <span className="text-[10px] text-rose-400 font-mono flex items-center gap-1 mt-0.5">
            <span className="w-1 h-1 bg-rose-500 rounded-full" />
            {errorMessage}
          </span>
        )}

        {!errorMessage && helperText && (
          <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
