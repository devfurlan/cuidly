import { PiWarningCircle } from 'react-icons/pi';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/shadcn/alert';

export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex w-full max-w-md flex-col gap-2 text-sm">
      {'success' in message && (
        <Alert variant="default">
          <PiWarningCircle className="h-4 w-4" />
          <AlertDescription>{message.success}</AlertDescription>
        </Alert>
      )}
      {'error' in message && (
        <Alert variant="destructive">
          <PiWarningCircle className="h-4 w-4" />
          <AlertTitle>{message.error}</AlertTitle>
        </Alert>
      )}
      {'message' in message && (
        <Alert variant="default">
          <PiWarningCircle className="h-4 w-4" />
          <AlertDescription>{message.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
