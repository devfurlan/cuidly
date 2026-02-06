'use client';

import { PiWarningCircle } from 'react-icons/pi';

interface MissingFieldsBannerProps {
  fields: string[];
  title?: string;
}

export function MissingFieldsBanner({
  fields,
  title = 'Complete seu perfil',
}: MissingFieldsBannerProps) {
  if (fields.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <PiWarningCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
        <div>
          <p className="font-medium text-amber-800">{title}</p>
          <p className="mt-1 text-sm text-amber-700">
            Preencha os campos pendentes: {fields.join(', ')}
          </p>
        </div>
      </div>
    </div>
  );
}
