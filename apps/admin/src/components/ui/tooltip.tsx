'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/shadcn/utils';
import React from 'react';

export const TooltipProvider = TooltipPrimitive.Provider;
export const TooltipRadix = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 max-w-60 overflow-hidden rounded-lg border bg-gray-900 px-2.5 py-1.5 text-center text-xs text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-neutral-700',
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export function Tooltip({
  children,
  content,
  contentProps,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  contentProps?: React.ComponentPropsWithoutRef<typeof TooltipContent>;
}) {
  return (
    <TooltipProvider>
      <TooltipRadix>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent {...contentProps}>{content}</TooltipContent>
      </TooltipRadix>
    </TooltipProvider>
  );
}
