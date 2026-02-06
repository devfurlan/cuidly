'use client';

/**
 * Children Management Client Component
 * Gerenciamento de crianças para famílias
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PiBaby, PiPencilSimple, PiPlus, PiTrash, PiWarningCircle } from 'react-icons/pi';

import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/shadcn/avatar';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';
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
import { Textarea } from '@/components/ui/shadcn/textarea';
import { useApiError } from '@/hooks/useApiError';
import type { ChildData } from '@/lib/data/children';

interface Child extends ChildData {
  allergies?: string | null;
  routine?: string | null;
  isMain?: boolean;
}

interface ChildrenManagementProps {
  initialChildren: ChildData[];
}

const genderLabels: Record<string, string> = {
  MALE: 'Masculino',
  FEMALE: 'Feminino',
  OTHER: 'Outro',
};

const carePriorityOptions = [
  { value: 'ATTENTION_PATIENCE', label: 'Atenção e paciência no dia a dia' },
  { value: 'PLAY_STIMULATION', label: 'Brincadeiras e estímulo criativo' },
  { value: 'STRUCTURED_ROUTINE', label: 'Rotina bem organizada' },
  { value: 'SAFETY_SUPERVISION', label: 'Segurança e supervisão constante' },
  { value: 'SCHOOL_SUPPORT', label: 'Apoio nas tarefas escolares' },
  { value: 'AUTONOMY', label: 'Autonomia e incentivo à independência' },
  { value: 'EMOTIONAL_CARE', label: 'Acolhimento emocional' },
  { value: 'HIGH_ENERGY', label: 'Energia para acompanhar a criança' },
  { value: 'RESPECTFUL_DISCIPLINE', label: 'Disciplina com respeito' },
  { value: 'BABY_CARE', label: 'Cuidados com bebês e recém-nascidos' },
  { value: 'SLEEP_ROUTINE', label: 'Apoio na rotina de sono' },
  { value: 'FEEDING_SUPPORT', label: 'Apoio na alimentação do bebê' },
];

function getCarePriorityLabel(value: string): string {
  const option = carePriorityOptions.find((o) => o.value === value);
  return option?.label || value;
}

function calculateAge(birthDate: Date | null): string {
  if (!birthDate) return '-';
  const birth = new Date(birthDate);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }

  if (years === 0) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }

  return `${years} ${years === 1 ? 'ano' : 'anos'}`;
}

function getUserInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ChildrenManagement({ initialChildren }: ChildrenManagementProps) {
  const router = useRouter();
  const { showError, showSuccess } = useApiError();

  const [children, setChildren] = useState<Child[]>(initialChildren as Child[]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [childToDelete, setChildToDelete] = useState<Child | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    gender: '',
    carePriorities: [] as string[],
    hasSpecialNeeds: false,
    specialNeedsDescription: '',
    allergies: '',
    routine: '',
    notes: '',
  });

  const loadChildren = async () => {
    try {
      const response = await fetch('/api/families/children');
      if (response.ok) {
        const data = await response.json();
        setChildren(data.children || []);
      }
    } catch (error) {
      console.error('Error loading children:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      birthDate: '',
      gender: '',
      carePriorities: [],
      hasSpecialNeeds: false,
      specialNeedsDescription: '',
      allergies: '',
      routine: '',
      notes: '',
    });
    setEditingChild(null);
  };

  const handleOpenDialog = (child?: Child) => {
    if (child) {
      setEditingChild(child);
      setFormData({
        name: child.name || '',
        birthDate: child.birthDate
          ? new Date(child.birthDate).toISOString().split('T')[0]
          : '',
        gender: child.gender || '',
        carePriorities: [],
        hasSpecialNeeds: child.hasSpecialNeeds || false,
        specialNeedsDescription: child.specialNeedsDescription || '',
        allergies: child.allergies || '',
        routine: child.routine || '',
        notes: child.notes || '',
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showError(null, 'Nome é obrigatório');
      return;
    }

    setIsSaving(true);
    try {
      const url = editingChild
        ? `/api/families/children/${editingChild.id}`
        : '/api/families/children';

      const method = editingChild ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          birthDate: formData.birthDate || null,
          gender: formData.gender || null,
        }),
      });

      if (response.ok) {
        showSuccess(
          editingChild ? 'Criança atualizada!' : 'Criança adicionada!'
        );
        handleCloseDialog();
        loadChildren();
        router.refresh();
      } else {
        const data = await response.json();
        showError(null, data.error || 'Erro ao salvar');
      }
    } catch (error) {
      console.error('Error saving child:', error);
      showError(error, 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDeleteDialog = (child: Child) => {
    setChildToDelete(child);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!childToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/families/children/${childToDelete.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        showSuccess('Criança removida!');
        setDeleteDialogOpen(false);
        setChildToDelete(null);
        loadChildren();
        router.refresh();
      } else {
        const data = await response.json();
        showError(null, data.error || 'Erro ao remover');
      }
    } catch (error) {
      console.error('Error deleting child:', error);
      showError(error, 'Erro ao remover');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleCarePriority = (value: string) => {
    setFormData((prev) => {
      const currentArray = prev.carePriorities;
      if (currentArray.includes(value)) {
        return { ...prev, carePriorities: currentArray.filter((i) => i !== value) };
      } else if (currentArray.length < 3) {
        return { ...prev, carePriorities: [...currentArray, value] };
      }
      return prev;
    });
  };

  return (
    <>
      {/* Subtitle + Actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-gray-600">
          Gerencie as informações das suas crianças
        </p>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => handleOpenDialog()}
        >
          <PiPlus className="mr-2 size-4" />
          Adicionar Filho
        </Button>
      </div>

      {/* Children List */}
      {children.length === 0 ? (
        <Card className="p-12 text-center">
          <PiBaby className="mx-auto size-16 text-gray-300" />
          <h3 className="mt-4 text-xl font-bold text-gray-900">
            Nenhuma criança cadastrada
          </h3>
          <p className="mt-2 text-gray-600">
            Adicione informações dos seus filhos para criar vagas personalizadas
          </p>
          <Button
            className="mt-6 bg-blue-600 hover:bg-blue-700"
            onClick={() => handleOpenDialog()}
          >
            <PiPlus className="mr-2 size-4" />
            Adicionar Primeiro Filho
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {children.map((child) => (
            <Card key={child.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-14">
                      <AvatarFallback className="bg-fuchsia-100 text-lg text-fuchsia-600">
                        {getUserInitials(child.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">
                        {child.name || 'Sem nome'}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {calculateAge(child.birthDate)}
                        {child.gender && ` • ${genderLabels[child.gender]}`}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(child)}
                    >
                      <PiPencilSimple className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDeleteDialog(child)}
                    >
                      <PiTrash className="size-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {child.isMain && (
                    <Badge variant="info">Principal</Badge>
                  )}
                  {child.hasSpecialNeeds && (
                    <Badge variant="purple-outline">
                      Necessidades especiais
                    </Badge>
                  )}
                </div>

                {/* Special Needs Description */}
                {child.hasSpecialNeeds && child.specialNeedsDescription && (
                  <div className="rounded-lg bg-purple-50 p-3">
                    <p className="text-sm font-medium text-purple-800">
                      Necessidades Especiais:
                    </p>
                    <p className="mt-1 text-sm text-purple-700">
                      {child.specialNeedsDescription}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingChild ? 'Editar Criança' : 'Adicionar Criança'}
            </DialogTitle>
            <DialogDescription>
              {editingChild
                ? 'Atualize as informações da criança'
                : 'Adicione uma nova criança ao seu perfil'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nome da criança"
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Sexo</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Masculino</SelectItem>
                  <SelectItem value="FEMALE">Feminino</SelectItem>
                  <SelectItem value="OTHER">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Care Priorities */}
            <div className="space-y-2">
              <Label>Prioridades de Cuidado (máx. 3)</Label>
              <p className="text-sm text-gray-500">
                {formData.carePriorities.length}/3 selecionadas
              </p>
              <div className="flex flex-wrap gap-2">
                {carePriorityOptions.map((option) => {
                  const isSelected = formData.carePriorities.includes(option.value);
                  const isDisabled = !isSelected && formData.carePriorities.length >= 3;
                  return (
                    <Badge
                      key={option.value}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !isDisabled && toggleCarePriority(option.value)}
                    >
                      {option.label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Special Needs */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasSpecialNeeds"
                  checked={formData.hasSpecialNeeds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hasSpecialNeeds: e.target.checked,
                    })
                  }
                  className="size-4 rounded border-gray-300"
                />
                <Label htmlFor="hasSpecialNeeds">
                  Possui necessidades especiais
                </Label>
              </div>
              {formData.hasSpecialNeeds && (
                <Textarea
                  placeholder="Descreva as necessidades especiais..."
                  value={formData.specialNeedsDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specialNeedsDescription: e.target.value,
                    })
                  }
                  rows={3}
                />
              )}
            </div>

            {/* Allergies */}
            <div className="space-y-2">
              <Label htmlFor="allergies">Alergias</Label>
              <Input
                id="allergies"
                value={formData.allergies}
                onChange={(e) =>
                  setFormData({ ...formData, allergies: e.target.value })
                }
                placeholder="Ex: Amendoim, lactose..."
              />
            </div>

            {/* Routine */}
            <div className="space-y-2">
              <Label htmlFor="routine">Rotina</Label>
              <Textarea
                id="routine"
                value={formData.routine}
                onChange={(e) =>
                  setFormData({ ...formData, routine: e.target.value })
                }
                placeholder="Descreva a rotina da criança..."
                rows={3}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Outras informações importantes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving
                ? 'Salvando...'
                : editingChild
                  ? 'Atualizar'
                  : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <PiWarningCircle className="size-6" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover{' '}
              <strong>{childToDelete?.name}</strong>? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Removendo...' : 'Remover'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
