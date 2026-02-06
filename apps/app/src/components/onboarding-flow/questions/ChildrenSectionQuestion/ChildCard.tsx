'use client';

import { useState } from 'react';
import { formatAge, getCarePriorityLabel } from '@/helpers/label-getters';
import { cn } from '@cuidly/shared';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/shadcn/alert-dialog';
import {
  PiBaby,
  PiGenderFemale,
  PiGenderMale,
  PiPencilSimple,
  PiTrash,
} from 'react-icons/pi';
import type { ChildData } from './types';

interface ChildCardProps {
  child: ChildData;
  onEdit: () => void;
  onRemove: () => void;
}

export function ChildCard({ child, onEdit, onRemove }: ChildCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const genderIcon =
    child.gender === 'FEMALE' ? (
      <PiGenderFemale className="size-5 text-pink-500" />
    ) : (
      <PiGenderMale className="size-5 text-blue-500" />
    );

  const genderLabel = child.gender === 'FEMALE' ? 'Menina' : 'Menino';

  // Calculate age or show expected date for unborn
  let ageDisplay = '';
  if (child.unborn && child.expectedBirthDate) {
    const expectedDate = new Date(child.expectedBirthDate);
    const month = expectedDate.toLocaleDateString('pt-BR', { month: 'short' });
    const year = expectedDate.getFullYear();
    ageDisplay = `Previsão: ${month}/${year}`;
  } else if (child.birthDate) {
    ageDisplay = formatAge(child.birthDate);
  }

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-4 transition-all hover:border-gray-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {child.unborn ? (
            <div className="flex size-10 items-center justify-center rounded-full bg-purple-100">
              <PiBaby className="size-5 text-purple-600" />
            </div>
          ) : (
            <div
              className={cn(
                'flex size-10 items-center justify-center rounded-full',
                child.gender === 'FEMALE' ? 'bg-pink-100' : 'bg-blue-100',
              )}
            >
              {genderIcon}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {child.unborn ? 'Bebê a caminho' : child.name || genderLabel}
              </span>
              {ageDisplay && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{ageDisplay}</span>
                </>
              )}
              {child.hasSpecialNeeds && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                  Cuidado especial
                </span>
              )}
            </div>
            {!child.unborn &&
              child.carePriorities &&
              child.carePriorities.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {child.carePriorities.map((priority) => (
                    <span
                      key={priority}
                      className="rounded-full bg-fuchsia-100 px-2.5 py-0.5 text-xs font-medium text-fuchsia-700"
                    >
                      {getCarePriorityLabel(priority)}
                    </span>
                  ))}
                </div>
              )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Editar"
          >
            <PiPencilSimple className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            aria-label="Remover"
          >
            <PiTrash className="size-5" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover criança?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {child.unborn ? 'o bebê a caminho' : child.name || 'esta criança'}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onRemove}
              className="bg-red-600 hover:bg-red-700"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
