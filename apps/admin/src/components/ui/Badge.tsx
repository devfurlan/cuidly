import * as React from 'react';
import { cn } from '@/lib/shadcn/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-x-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        fuchsia: 'bg-fuchsia-600 text-white',
        black: 'bg-gray-900 text-white',
        muted: 'bg-gray-500 text-white',
        teal: 'bg-teal-500 text-white',
        blue: 'bg-blue-600 text-white',
        red: 'bg-red-500 text-white',
        yellow: 'bg-yellow-500 text-white',
        orange: 'bg-orange-500 text-white',
        purple: 'bg-purple-600 text-white',
        white: 'bg-white text-gray-600',
      },
      type: {
        solid: '',
        soft: 'bg-opacity-20 text-opacity-80',
        outline: 'border',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-2',
      },
      withIndicator: {
        true: 'relative pl-4',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      type: 'solid',
      size: 'sm',
      withIndicator: false,
    },
    compoundVariants: [
      {
        variant: 'default',
        type: 'soft',
        className: 'bg-primary/10 text-primary',
      },
      {
        variant: 'secondary',
        type: 'soft',
        className: 'bg-secondary/10 text-secondary-foreground',
      },
      {
        variant: 'destructive',
        type: 'soft',
        className: 'bg-destructive/10 text-destructive',
      },
      {
        variant: 'black',
        type: 'soft',
        className: 'bg-gray-100 text-gray-800',
      },
      { variant: 'muted', type: 'soft', className: 'bg-gray-50 text-gray-500' },
      { variant: 'teal', type: 'soft', className: 'bg-teal-100 text-teal-800' },
      { variant: 'blue', type: 'soft', className: 'bg-blue-100 text-blue-800' },
      { variant: 'red', type: 'soft', className: 'bg-red-100 text-red-800' },
      {
        variant: 'yellow',
        type: 'soft',
        className: 'bg-yellow-100 text-yellow-800',
      },
      {
        variant: 'orange',
        type: 'soft',
        className: 'bg-orange-100 text-orange-800',
      },
      {
        variant: 'purple',
        type: 'soft',
        className: 'bg-purple-100 text-purple-800',
      },
      { variant: 'white', type: 'soft', className: 'bg-white/10 text-white' },
      {
        variant: 'black',
        type: 'outline',
        className: 'border-gray-800 text-gray-800',
      },
      {
        variant: 'muted',
        type: 'outline',
        className: 'border-gray-500 text-gray-500',
      },
      {
        variant: 'teal',
        type: 'outline',
        className: 'border-teal-500 text-teal-500',
      },
      {
        variant: 'blue',
        type: 'outline',
        className: 'border-blue-600 text-blue-600',
      },
      {
        variant: 'red',
        type: 'outline',
        className: 'border-red-500 text-red-500',
      },
      {
        variant: 'yellow',
        type: 'outline',
        className: 'border-yellow-500 text-yellow-500',
      },
      {
        variant: 'orange',
        type: 'outline',
        className: 'border-orange text-orange',
      },
      {
        variant: 'purple',
        type: 'outline',
        className: 'border-purple-500 text-purple-500',
      },
      {
        variant: 'white',
        type: 'outline',
        className: 'border-white text-white',
      },
    ],
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  indicatorColor?: string;
}

function Badge({
  className,
  variant,
  type,
  size,
  withIndicator,
  icon,
  indicatorColor,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant, type, size, withIndicator }),
        className,
      )}
      {...props}
    >
      {withIndicator && (
        <span
          className={cn(
            'absolute left-1 top-1.5 inline-block size-1.5 rounded-full',
            indicatorColor || 'bg-current',
          )}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {props.children}
    </div>
  );
}

export { Badge, badgeVariants };
