import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { createContext, useContext } from 'react';
import { PiX } from 'react-icons/pi';

import { cn } from '@cuidly/shared';

const AlertContext = createContext<{ hasDismiss: boolean }>({
  hasDismiss: false,
});

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-4 gap-y-0.5 items-start [&>svg]:size-5 [&>svg]:-mt-0.5 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground border-gray-200',
        destructive:
          'text-destructive border-destructive bg-destructive/5 [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90',
        info: 'bg-blue-50 border-blue-200 text-blue-700 [&>svg]:text-blue-700',
        success:
          'bg-green-50 border-green-200 text-green-700 [&>svg]:text-green-700',
        warning:
          'bg-yellow-50 border-yellow-200 text-yellow-700 [&>svg]:text-yellow-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

interface AlertProps
  extends React.ComponentProps<'div'>, VariantProps<typeof alertVariants> {
  onDismiss?: () => void;
}

function Alert({
  className,
  variant,
  onDismiss,
  children,
  ...props
}: AlertProps) {
  return (
    <AlertContext.Provider value={{ hasDismiss: !!onDismiss }}>
      <div
        data-slot="alert"
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {children}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1.5 text-gray-500 transition-colors hover:text-gray-900"
            aria-label="Fechar"
          >
            <PiX className="size-3.5" />
          </button>
        )}
      </div>
    </AlertContext.Provider>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'col-start-2 min-h-4 text-base font-semibold tracking-tight',
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'col-start-2 grid justify-items-start gap-1 text-sm text-gray-600! [&_p]:leading-relaxed',
        className,
      )}
      {...props}
    />
  );
}

function AlertActions({ className, ...props }: React.ComponentProps<'div'>) {
  const { hasDismiss } = useContext(AlertContext);
  return (
    <div
      data-slot="alert-actions"
      className={cn(
        'absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2',
        className,
        hasDismiss && 'pr-10',
      )}
      {...props}
    />
  );
}

export { Alert, AlertActions, AlertDescription, AlertTitle };
