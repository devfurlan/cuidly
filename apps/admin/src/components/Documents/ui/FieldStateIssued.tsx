import { useForm } from 'react-hook-form';
import { NannyDocument } from '../schemas';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { brazilianStates } from '@/constants/brazilianStates';

export default function FieldStateIssued({
  form,
  required = false,
}: {
  form: ReturnType<typeof useForm<NannyDocument>>;
  required?: boolean;
}) {
  return (
    <FormField
      name="stateIssued"
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel isOptional={!required}>UF</FormLabel>
          <FormControl>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              required={required}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(brazilianStates).map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
