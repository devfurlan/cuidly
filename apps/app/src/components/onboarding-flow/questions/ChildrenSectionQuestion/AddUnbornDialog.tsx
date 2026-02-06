'use client';

import { Button } from '@/components/ui/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import {
  Field,
  FieldDescription,
  FieldError,
} from '@/components/ui/shadcn/field';
import { Input } from '@/components/ui/shadcn/input';
import { maskDate } from '@/helpers/formatters';
import { useEffect, useState } from 'react';
import { PiBaby } from 'react-icons/pi';
import type { ChildData } from './types';

interface AddUnbornDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (child: ChildData) => void;
  editingChild?: ChildData | null;
}

export function AddUnbornDialog({
  open,
  onOpenChange,
  onSave,
  editingChild,
}: AddUnbornDialogProps) {
  const [expectedDate, setExpectedDate] = useState('');
  const [error, setError] = useState('');

  // Reset form when dialog opens/closes or editingChild changes
  useEffect(() => {
    if (open) {
      if (editingChild?.unborn && editingChild.expectedBirthDate) {
        const date = new Date(editingChild.expectedBirthDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        setExpectedDate(`${day}/${month}/${year}`);
      } else {
        setExpectedDate('');
      }
      setError('');
    }
  }, [open, editingChild]);

  const parseDateInput = (value: string): Date | null => {
    const parts = value.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    if (!day || !month || !year) return null;
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return null;
    return date;
  };

  const handleSave = () => {
    // Validate expected date
    const parsedDate = parseDateInput(expectedDate);
    if (!parsedDate) {
      setError('Essa data não parece certa. Confira novamente?');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate <= today) {
      setError('A data precisa ser futura para bebês a caminho');
      return;
    }

    const childData: ChildData = {
      id: editingChild?.id,
      tempId: editingChild?.tempId || crypto.randomUUID(),
      gender: 'FEMALE', // Default for unborn
      birthDate: null,
      expectedBirthDate: parsedDate.toISOString(),
      carePriorities: [],
      hasSpecialNeeds: false,
      specialNeedsTypes: [],
      unborn: true,
    };

    onSave(childData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Um novo membro chegando!</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-purple-100">
              <PiBaby className="size-8 text-purple-600" />
            </div>
          </div>

          <p className="mb-4 text-center text-gray-800">
            Parabéns! Quando o bebê vai chegar?
          </p>

          {/* Expected Date */}
          <Field data-invalid={!!error}>
            {/* <FieldLabel>Data prevista para o nascimento</FieldLabel> */}
            <Input
              type="text"
              placeholder="DD/MM/AAAA"
              value={expectedDate}
              onChange={(e) => {
                setExpectedDate(maskDate(e.target.value));
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                }
              }}
              maxLength={10}
              aria-invalid={!!error}
              className="text-center"
            />
            <FieldDescription className="text-center">
              Data prevista para o nascimento
            </FieldDescription>

            {error && <FieldError className="text-center">{error}</FieldError>}
          </Field>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            {editingChild ? 'Salvar alterações' : 'Adicionar bebê'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
