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
import { maskAlphanumeric } from '@/utils/maskAlphanumeric';

export default function FieldExpirationDate({
  form,
  required = false,
}: {
  form: ReturnType<typeof useForm<NannyDocument>>;
  required?: boolean;
}) {
  return (
    <FormField
      name="expirationDate"
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel isOptional={!required}>Data de validade</FormLabel>
          <FormControl>
            <Input
              placeholder="30/11/2034"
              {...field}
              value={field.value || ''}
              onChange={(e) =>
                form.setValue(
                  'expirationDate',
                  maskAlphanumeric(e.target.value, '##/##/####'),
                )
              }
              required={required}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
