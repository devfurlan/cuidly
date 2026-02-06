'use client';

import { useState } from 'react';
import { PiPencilSimple, PiPlus, PiTrash } from 'react-icons/pi';
import { Button } from '@/components/ui/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/shadcn/alert-dialog';
import { useApiError } from '@/hooks/useApiError';
import { maskPhone, formatPhoneDisplay } from '@/helpers/formatters';

interface Reference {
  id: number;
  name: string;
  phone: string;
  relationship: string;
  verified: boolean;
}

interface ReferenceSectionProps {
  references: Reference[];
  onUpdate: () => void | Promise<void>;
  onAdd?: () => void;
}

const RELATIONSHIP_OPTIONS = [
  { value: 'ex-empregador', label: 'Ex-empregador(a)' },
  { value: 'colega-trabalho', label: 'Colega de trabalho' },
  { value: 'familiar-crianca', label: 'Familiar de criança que cuidei' },
  { value: 'professor', label: 'Professor(a) / Instrutor(a)' },
  { value: 'outro', label: 'Outro' },
];

export function ReferenceSection({ references, onUpdate }: ReferenceSectionProps) {
  const { showError, showSuccess } = useApiError();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    index: number;
    name: string;
    isDeleting: boolean;
  }>({ open: false, index: -1, name: '', isDeleting: false });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Telefone inválido';
    }

    if (!formData.relationship) {
      newErrors.relationship = 'Selecione o tipo de relação';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenDialog = (index?: number) => {
    if (index !== undefined) {
      const ref = references[index];
      setFormData({
        name: ref.name,
        phone: formatPhoneDisplay(ref.phone),
        relationship: ref.relationship,
      });
      setEditingIndex(index);
    } else {
      setFormData({ name: '', phone: '', relationship: '' });
      setEditingIndex(null);
    }
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingIndex(null);
    setErrors({});
    setIsSaving(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskPhone(e.target.value);
    setFormData({ ...formData, phone: masked });
    if (errors.phone) {
      setErrors({ ...errors, phone: '' });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
    if (errors.name) {
      setErrors({ ...errors, name: '' });
    }
  };

  const handleRelationshipChange = (value: string) => {
    setFormData({ ...formData, relationship: value });
    if (errors.relationship) {
      setErrors({ ...errors, relationship: '' });
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      let updatedReferences;

      if (editingIndex !== null) {
        updatedReferences = references.map((ref, index) => {
          if (index === editingIndex) {
            return {
              name: formData.name.trim(),
              phone: formData.phone,
              relationship: formData.relationship,
            };
          }
          return {
            name: ref.name,
            phone: ref.phone,
            relationship: ref.relationship,
          };
        });
      } else {
        updatedReferences = [
          ...references.map((ref) => ({
            name: ref.name,
            phone: ref.phone,
            relationship: ref.relationship,
          })),
          {
            name: formData.name.trim(),
            phone: formData.phone,
            relationship: formData.relationship,
          },
        ];
      }

      const response = await fetch('/api/nannies/save-references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ references: updatedReferences }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar referência');
      }

      await onUpdate();
      handleCloseDialog();
      showSuccess(
        editingIndex !== null
          ? 'Referência atualizada com sucesso!'
          : 'Referência adicionada com sucesso!',
      );
    } catch (error) {
      showError(error as Error, 'Erro ao salvar');
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (index: number, name: string) => {
    setDeleteConfirm({ open: true, index, name, isDeleting: false });
  };

  const handleDeleteConfirm = async () => {
    const indexToRemove = deleteConfirm.index;
    setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }));
    try {
      const updatedReferences = references
        .filter((_, index) => index !== indexToRemove)
        .map((ref) => ({
          name: ref.name,
          phone: ref.phone,
          relationship: ref.relationship,
        }));

      const response = await fetch('/api/nannies/save-references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ references: updatedReferences }),
      });

      if (!response.ok) {
        throw new Error('Erro ao remover referência');
      }

      await onUpdate();
      setDeleteConfirm({ open: false, index: -1, name: '', isDeleting: false });
      showSuccess('Referência removida com sucesso!');
    } catch (error) {
      showError(error as Error, 'Erro ao remover');
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const getRelationshipLabel = (value: string) => {
    return RELATIONSHIP_OPTIONS.find((opt) => opt.value === value)?.label || value;
  };

  return (
    <>
      {references.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-sm italic text-gray-400">
            Nenhuma referência adicionada ainda.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Adicione referências para aumentar a confiança das famílias no seu
            perfil.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => handleOpenDialog()}
          >
            <PiPlus className="mr-1.5 size-4" />
            Adicionar Referência
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {references.map((ref, index) => (
            <div
              key={ref.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{ref.name}</p>
                <p className="text-xs text-gray-500">
                  {getRelationshipLabel(ref.relationship)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleOpenDialog(index)}
                  disabled={isSaving}
                >
                  <PiPencilSimple className="size-4 text-gray-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDeleteClick(index, ref.name)}
                  disabled={isSaving}
                >
                  <PiTrash className="size-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => handleOpenDialog()}
          >
            <PiPlus className="mr-1.5 size-4" />
            Adicionar Referência
          </Button>
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => !open && !isSaving && handleCloseDialog()}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>
                {editingIndex !== null ? 'Editar Referência' : 'Adicionar Referência'}
              </DialogTitle>
              <DialogDescription>
                {editingIndex !== null
                  ? 'Atualize as informações da referência.'
                  : 'Adicione uma pessoa que pode atestar a qualidade do seu trabalho como babá.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ref-name">Nome completo</Label>
                <Input
                  id="ref-name"
                  placeholder="Ex: Maria Silva"
                  value={formData.name}
                  onChange={handleNameChange}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ref-phone">Telefone</Label>
                <Input
                  id="ref-phone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ref-relationship">Tipo de relação</Label>
                <Select
                  value={formData.relationship}
                  onValueChange={handleRelationshipChange}
                >
                  <SelectTrigger
                    id="ref-relationship"
                    aria-invalid={!!errors.relationship}
                  >
                    <SelectValue placeholder="Selecione o tipo de relação" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.relationship && (
                  <p className="text-xs text-red-500">{errors.relationship}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? editingIndex !== null
                    ? 'Salvando...'
                    : 'Adicionando...'
                  : editingIndex !== null
                    ? 'Salvar'
                    : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) =>
          !open &&
          !deleteConfirm.isDeleting &&
          setDeleteConfirm({ open: false, index: -1, name: '', isDeleting: false })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover referência</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a referência de{' '}
              <strong>{deleteConfirm.name}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteConfirm.isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deleteConfirm.isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteConfirm.isDeleting ? 'Removendo...' : 'Remover'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
