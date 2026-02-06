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
  FieldLabel,
} from '@/components/ui/shadcn/field';
import { Input } from '@/components/ui/shadcn/input';
import { Switch } from '@/components/ui/shadcn/switch';
import { CARE_PRIORITIES_OPTIONS } from '@/constants/options/family-options';
import { SPECIAL_NEEDS_OPTIONS } from '@/constants/options/common-options';
import { cn } from '@cuidly/shared';
import { maskDate } from '@/helpers/formatters';
import { useEffect, useState } from 'react';
import {
  PiCheckSquareFill,
  PiGenderFemale,
  PiGenderMale,
  PiSquare,
} from 'react-icons/pi';
import type { ChildData } from './types';

interface AddChildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (child: ChildData) => void;
  editingChild?: ChildData | null;
}

export function AddChildDialog({
  open,
  onOpenChange,
  onSave,
  editingChild,
}: AddChildDialogProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [birthDate, setBirthDate] = useState('');
  const [carePriorities, setCarePriorities] = useState<string[]>([]);
  const [hasSpecialNeeds, setHasSpecialNeeds] = useState(false);
  const [specialNeedsTypes, setSpecialNeedsTypes] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string; birthDate?: string }>(
    {},
  );

  // Reset form when dialog opens/closes or editingChild changes
  useEffect(() => {
    if (open) {
      if (editingChild && !editingChild.unborn) {
        setName(editingChild.name || '');
        setGender(editingChild.gender);
        setBirthDate(
          editingChild.birthDate
            ? formatDateForInput(editingChild.birthDate)
            : '',
        );
        setCarePriorities(editingChild.carePriorities || []);
        setHasSpecialNeeds(editingChild.hasSpecialNeeds || false);
        setSpecialNeedsTypes(editingChild.specialNeedsTypes || []);
      } else {
        setName('');
        setGender('FEMALE');
        setBirthDate('');
        setCarePriorities([]);
        setHasSpecialNeeds(false);
        setSpecialNeedsTypes([]);
      }
      setErrors({});
    }
  }, [open, editingChild]);

  const formatDateForInput = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDateInput = (value: string): Date | null => {
    const parts = value.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    if (!day || !month || !year) return null;
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return null;
    return date;
  };

  const toggleCarePriority = (value: string) => {
    if (carePriorities.includes(value)) {
      setCarePriorities(carePriorities.filter((p) => p !== value));
    } else if (carePriorities.length < 3) {
      setCarePriorities([...carePriorities, value]);
    }
  };

  const toggleSpecialNeed = (value: string) => {
    if (specialNeedsTypes.includes(value)) {
      setSpecialNeedsTypes(specialNeedsTypes.filter((t) => t !== value));
    } else {
      setSpecialNeedsTypes([...specialNeedsTypes, value]);
    }
  };

  const handleSave = () => {
    const newErrors: { name?: string; birthDate?: string } = {};

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Nome da criança é obrigatório';
    }

    // Validate birth date
    const parsedDate = parseDateInput(birthDate);
    if (!parsedDate) {
      newErrors.birthDate = 'Essa data não parece certa. Confira novamente?';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsedDate > today) {
        newErrors.birthDate = 'Ops! Essa data ainda não chegou 😊';
      } else {
        // Check if child is 18 or older
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
        eighteenYearsAgo.setHours(0, 0, 0, 0);
        if (parsedDate <= eighteenYearsAgo) {
          newErrors.birthDate = 'Para maiores de 18 anos, não é necessário cadastrar';
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const childData: ChildData = {
      id: editingChild?.id,
      tempId: editingChild?.tempId || crypto.randomUUID(),
      name: name.trim(),
      gender,
      birthDate: parsedDate!.toISOString(),
      expectedBirthDate: null,
      carePriorities,
      hasSpecialNeeds,
      specialNeedsTypes: hasSpecialNeeds ? specialNeedsTypes : [],
      unborn: false,
    };

    onSave(childData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingChild ? 'Editar informações' : 'Conte sobre seu filho(a)'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name */}
          <Field data-invalid={!!errors.name}>
            <FieldLabel>Nome da criança</FieldLabel>
            <Input
              type="text"
              placeholder="Ex: Maria"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              maxLength={100}
              aria-invalid={!!errors.name}
            />
            {errors.name && <FieldError>{errors.name}</FieldError>}
          </Field>

          {/* Gender Selection */}
          <Field>
            <div className="flex items-center gap-4">
              <FieldLabel>Sexo</FieldLabel>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender('FEMALE')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-all',
                    gender === 'FEMALE'
                      ? 'border-pink-400 bg-pink-50 text-pink-600'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300',
                  )}
                >
                  <PiGenderFemale className="size-4" />
                  <span>Feminino</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('MALE')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-all',
                    gender === 'MALE'
                      ? 'border-blue-400 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300',
                  )}
                >
                  <PiGenderMale className="size-4" />
                  <span>Masculino</span>
                </button>
              </div>
            </div>
          </Field>

          {/* Birth Date */}
          <Field data-invalid={!!errors.birthDate}>
            <FieldLabel>Quando nasceu?</FieldLabel>
            <div className="flex items-center gap-3">
              <Input
                type="text"
                placeholder="DD/MM/AAAA"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(maskDate(e.target.value));
                  setErrors((prev) => ({ ...prev, birthDate: undefined }));
                }}
                maxLength={10}
                className="flex-1"
                aria-invalid={!!errors.birthDate}
              />
            </div>
            {errors.birthDate && <FieldError>{errors.birthDate}</FieldError>}
          </Field>

          {/* Care Priorities Selection */}
          <Field>
            <FieldLabel>
              O que é essencial no cuidado dele(a)?
            </FieldLabel>
            <FieldDescription>
              Escolha até 3 prioridades - {carePriorities.length}/3
            </FieldDescription>
            <div className="flex flex-wrap gap-2">
              {CARE_PRIORITIES_OPTIONS.map((option) => {
                const isSelected = carePriorities.includes(option.value);
                const isDisabled = !isSelected && carePriorities.length >= 3;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleCarePriority(option.value)}
                    disabled={isDisabled}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all',
                      isSelected
                        ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700'
                        : isDisabled
                          ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
                    )}
                  >
                    {isSelected ? (
                      <PiCheckSquareFill className="size-4" />
                    ) : (
                      <PiSquare className="size-4" />
                    )}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Special Needs */}
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel>Precisa de algum cuidado especial?</FieldLabel>
              <Switch
                checked={hasSpecialNeeds}
                onCheckedChange={setHasSpecialNeeds}
              />
            </div>
          </Field>

          {/* Special Needs Types */}
          {hasSpecialNeeds && (
            <Field>
              <FieldLabel>Quais cuidados especiais?</FieldLabel>
              <FieldDescription>
                Selecione todos que se aplicam
              </FieldDescription>
              <div className="mt-2 flex flex-wrap gap-2">
                {SPECIAL_NEEDS_OPTIONS.map((option) => {
                  const isSelected = specialNeedsTypes.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleSpecialNeed(option.value)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all',
                        isSelected
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
                      )}
                    >
                      {isSelected ? (
                        <PiCheckSquareFill className="size-4" />
                      ) : (
                        <PiSquare className="size-4" />
                      )}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          )}
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
            {editingChild ? 'Salvar alterações' : 'Adicionar criança'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
