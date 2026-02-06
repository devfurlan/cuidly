import { useForm } from 'react-hook-form';
import { NannyDocument } from '../schemas';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';

export default function FieldIssuedBy({
  form,
  required = false,
}: {
  form: ReturnType<typeof useForm<NannyDocument>>;
  required?: boolean;
}) {
  return (
    <FormField
      name="issuedBy"
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel isOptional={!required}>Órgão emissor</FormLabel>
          <FormControl>
            <Input
              placeholder="SSP"
              {...field}
              value={field.value || ''}
              required={required}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
