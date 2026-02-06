'use client';

import { AdminPermission } from '@prisma/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ALL_PERMISSIONS, PERMISSION_LABELS, PERMISSION_DESCRIPTIONS } from '@/lib/permissions';

type PermissionsCheckboxGroupProps = {
  value: AdminPermission[];
  onChange: (permissions: AdminPermission[]) => void;
  disabled?: boolean;
};

export function PermissionsCheckboxGroup({
  value,
  onChange,
  disabled = false,
}: PermissionsCheckboxGroupProps) {
  const handleToggle = (permission: AdminPermission) => {
    if (value.includes(permission)) {
      onChange(value.filter((p) => p !== permission));
    } else {
      onChange([...value, permission]);
    }
  };

  return (
    <div className="space-y-4">
      {ALL_PERMISSIONS.map((permission) => (
        <div key={permission} className="flex items-start space-x-3">
          <Checkbox
            id={permission}
            checked={value.includes(permission)}
            onCheckedChange={() => handleToggle(permission)}
            disabled={disabled}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor={permission}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {PERMISSION_LABELS[permission]}
            </Label>
            <p className="text-sm text-muted-foreground">
              {PERMISSION_DESCRIPTIONS[permission]}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
