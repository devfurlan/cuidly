import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@cuidly/shared';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        // Default/Neutral
        default: 'border-transparent bg-gray-100 text-gray-700',
        'default-solid': 'border-transparent bg-gray-500 text-white',
        'default-outline': 'border-gray-300 bg-transparent text-gray-700',

        // Success (green)
        success: 'border-transparent bg-green-100 text-green-700',
        'success-solid': 'border-transparent bg-green-500 text-white',
        'success-outline': 'border-green-300 bg-transparent text-green-700',

        // Warning (amber/yellow)
        warning: 'border-transparent bg-amber-100 text-amber-700',
        'warning-solid': 'border-transparent bg-amber-500 text-white',
        'warning-outline': 'border-amber-300 bg-transparent text-amber-700',

        // Destructive/Error (red)
        destructive: 'border-transparent bg-red-100 text-red-700',
        'destructive-solid': 'border-transparent bg-red-500 text-white',
        'destructive-outline': 'border-red-300 bg-transparent text-red-700',

        // Info (blue)
        info: 'border-transparent bg-blue-100 text-blue-700',
        'info-solid': 'border-transparent bg-blue-500 text-white',
        'info-outline': 'border-blue-300 bg-transparent text-blue-700',

        // Purple
        purple: 'border-transparent bg-purple-100 text-purple-700',
        'purple-solid': 'border-transparent bg-purple-500 text-white',
        'purple-outline': 'border-purple-300 bg-transparent text-purple-700',

        // Fuchsia (brand color) - also aliased as "pink" for backward compatibility
        fuchsia: 'border-transparent bg-fuchsia-100 text-fuchsia-700',
        'fuchsia-solid': 'border-transparent bg-fuchsia-500 text-white',
        'fuchsia-outline': 'border-fuchsia-300 bg-transparent text-fuchsia-700',
        pink: 'border-transparent bg-fuchsia-100 text-fuchsia-700',
        'pink-solid': 'border-transparent bg-fuchsia-500 text-white',
        'pink-outline': 'border-fuchsia-300 bg-transparent text-fuchsia-700',

        // Teal
        teal: 'border-transparent bg-teal-100 text-teal-700',
        'teal-solid': 'border-transparent bg-teal-500 text-white',
        'teal-outline': 'border-teal-300 bg-transparent text-teal-700',

        // Generic outline (for backward compat with shadcn)
        outline: 'border-gray-300 bg-transparent text-gray-700',
        secondary: 'border-transparent bg-gray-100 text-gray-700',
        'secondary-solid': 'border-transparent bg-gray-500 text-white',
        'secondary-outline': 'border-gray-300 bg-transparent text-gray-700',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
