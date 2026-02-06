'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WarningCircleIcon } from '@phosphor-icons/react';

export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex w-full max-w-md flex-col gap-2 text-sm">
      {'success' in message && (
        <Alert variant="default">
          <WarningCircleIcon className="h-4 w-4" />
          <AlertDescription>{message.success}</AlertDescription>
        </Alert>
      )}
      {'error' in message && (
        <Alert variant="destructive">
          <WarningCircleIcon className="h-4 w-4" />
          <AlertTitle>{message.error}</AlertTitle>
        </Alert>
      )}
      {'message' in message && (
        <Alert variant="default">
          <WarningCircleIcon className="h-4 w-4" />
          <AlertDescription>{message.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
