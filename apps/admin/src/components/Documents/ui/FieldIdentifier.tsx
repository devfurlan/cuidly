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
import clsx, { ClassValue } from 'clsx';

export default function FieldIdentifier({
  form,
  placeholder,
  mask,
  label,
  className,
  required = false,
}: {
  form: ReturnType<typeof useForm<NannyDocument>>;
  placeholder: string;
  mask?: string;
  label?: string;
  className?: ClassValue;
  required?: boolean;
}) {
  return (
    <FormField
      name="identifier"
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel isOptional={!required}>{label || 'Número'}</FormLabel>
          <FormControl>
            <Input
              className={clsx(className)}
              placeholder={placeholder}
              autoComplete="off"
              {...field}
              value={field.value || ''}
              onChange={(e) => {
                const value = mask
                  ? maskAlphanumeric(e.target.value, mask)
                  : e.target.value;
                form.setValue('identifier', value);
              }}
              required={required}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
