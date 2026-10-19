import * as React from 'react';
import { cn } from '../../lib/utils';
import { Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'destructive' | 'amber';
  icon?: boolean;
}

const variantStyles: Record<string, string> = {
  info: 'bg-zinc-900 border-zinc-800 text-zinc-200',
  amber: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  destructive: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
};

const defaultIcons: Record<string, React.ReactNode> = {
  info: <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />,
  amber: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
  destructive: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', icon = true, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'relative w-full rounded-md border p-4 font-mono text-xs shadow-sm flex items-start gap-3',
        variantStyles[variant] || variantStyles.info,
        className
      )}
      {...props}
    >
      {icon && (defaultIcons[variant] || defaultIcons.info)}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
);
Alert.displayName = 'Alert';

export const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      'text-xs font-mono font-bold uppercase tracking-wider mb-1 text-zinc-100',
      className
    )}
    {...props}
  >
    {children}
  </h5>
));
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-xs font-mono text-zinc-400 leading-relaxed', className)}
    {...props}
  >
    {children}
  </div>
));
AlertDescription.displayName = 'AlertDescription';

export default Alert;
