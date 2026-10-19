import * as React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string | boolean;
  options?: SelectOption[];
  selectSize?: 'sm' | 'md' | 'lg';
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      options = [],
      selectSize = 'md',
      disabled,
      children,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const sizeStyles = {
      sm: 'h-8 px-2.5 pr-8 text-xs',
      md: 'h-9 px-3 pr-8 text-xs',
      lg: 'h-11 px-3.5 pr-9 text-sm',
    };

    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : undefined;

    return (
      <div className="w-full flex flex-col gap-1.5 font-mono">
        {label && (
          <label
            htmlFor={selectId}
            className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-zinc-400 select-none flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-amber-500 text-xs">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full bg-zinc-900 border text-zinc-100 rounded-sm font-mono transition-all duration-150 outline-none appearance-none cursor-pointer',
              'border-zinc-800 hover:border-zinc-700',
              'focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30',
              'disabled:opacity-50 disabled:bg-zinc-950 disabled:cursor-not-allowed',
              sizeStyles[selectSize],
              hasError && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30',
              className
            )}
            {...props}
          >
            {children ||
              options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="bg-zinc-900 text-zinc-100"
                >
                  {opt.label}
                </option>
              ))}
          </select>

          <div className="absolute right-3 flex items-center justify-center text-zinc-400 pointer-events-none">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
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

Select.displayName = 'Select';

export default Select;
