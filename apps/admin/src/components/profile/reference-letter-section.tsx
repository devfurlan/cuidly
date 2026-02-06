'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { getPrivateFileUrl } from '@/lib/supabase/storage/client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BriefcaseIcon,
  PencilSimpleIcon,
  CertificateIcon,
  PhoneIcon,
  PlusIcon,
  TrashIcon,
  UploadSimpleIcon,
  UserIcon,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Phone mask function
const maskPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers.length === 0 ? '' : `(${numbers}`;
  if (numbers.length <= 6)
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10)
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

// Reference letter form schema
const referenceLetterSchema = z.object({
  referrerName: z.string().min(1, 'Nome do recomendador é obrigatório'),
  referrerCompany: z.string().optional(),
  referrerPosition: z.string().optional(),
  referrerPhone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\(\d{2}\) \d{4,5}-\d{4}$/.test(val),
      'Telefone inválido',
    ),
  relationship: z.string().optional(),
  notes: z.string().optional(),
  file: z.any(),
});

type ReferenceLetterFormData = z.infer<typeof referenceLetterSchema>;

interface ReferenceLetter {
  id: number;
  identifier: string;
  institutionName?: string;
  issuedBy?: string;
  stateIssued?: string;
  fileUrl?: string;
}

interface ReferenceLetterSectionProps {
  partnerId: number;
  referenceLetters: ReferenceLetter[];
  onUpdate: () => void;
}

export function ReferenceLetterSection({
  partnerId,
  referenceLetters,
  onUpdate,
}: ReferenceLetterSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<ReferenceLetter | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<ReferenceLetterFormData>({
    resolver: zodResolver(referenceLetterSchema),
    defaultValues: {
      referrerName: '',
      referrerCompany: '',
      referrerPosition: '',
      referrerPhone: '',
      relationship: '',
      notes: '',
    },
  });

  const handleOpenDialog = (letter?: ReferenceLetter) => {
    if (letter) {
      setEditingLetter(letter);
      // Parse the identifier which should contain: referrerName | referrerCompany
      const [name, company] = letter.identifier.split(' | ');
      form.reset({
        referrerName: name || letter.identifier,
        referrerCompany: company || letter.institutionName || '',
        referrerPosition: letter.issuedBy || '',
        referrerPhone: letter.stateIssued || '',
        relationship: '',
        notes: '',
      });
    } else {
      setEditingLetter(null);
      form.reset({
        referrerName: '',
        referrerCompany: '',
        referrerPosition: '',
        referrerPhone: '',
        relationship: '',
        notes: '',
      });
    }
    setSelectedFile(null);
    setUploadError(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLetter(null);
    setSelectedFile(null);
    setUploadError(null);
    form.reset();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Tipo de arquivo não suportado. Use PDF, JPG ou PNG');
      setSelectedFile(null);
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Arquivo muito grande. Tamanho máximo: 10MB');
      setSelectedFile(null);
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
  };

  const onSubmit = async (data: ReferenceLetterFormData) => {
    setIsSubmitting(true);
    setUploadError(null);

    // Validate file is required for new letters
    if (!editingLetter && !selectedFile) {
      setUploadError('Arquivo da carta é obrigatório');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('partnerId', String(partnerId));
      formData.append('referrerName', data.referrerName);
      if (data.referrerCompany) {
        formData.append('referrerCompany', data.referrerCompany);
      }
      if (data.referrerPosition) {
        formData.append('referrerPosition', data.referrerPosition);
      }
      if (data.referrerPhone) {
        formData.append('referrerPhone', data.referrerPhone.replace(/\D/g, ''));
      }
      if (data.relationship) {
        formData.append('relationship', data.relationship);
      }
      if (data.notes) {
        formData.append('notes', data.notes);
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const url = editingLetter
        ? `/api/partners/documents/${editingLetter.id}`
        : '/api/partners/documents/reference-letter';

      const response = await fetch(url, {
        method: editingLetter ? 'PUT' : 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar carta de referência');
      }

      handleCloseDialog();
      toast({
        variant: 'success',
        title: editingLetter ? 'Carta atualizada' : 'Carta adicionada',
        description: editingLetter
          ? 'Carta de referência atualizada com sucesso!'
          : 'Carta de referência adicionada com sucesso!',
      });
      onUpdate();
    } catch (error) {
      console.error('Error saving reference letter:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar carta',
        description:
          error instanceof Error
            ? error.message
            : 'Erro ao salvar carta de referência. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (letterId: number) => {
    setLetterToDelete(letterId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!letterToDelete) return;

    try {
      const response = await fetch(
        `/api/partners/documents/${letterToDelete}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('Erro ao excluir carta de referência');
      }

      setDeleteDialogOpen(false);
      setLetterToDelete(null);
      toast({
        variant: 'success',
        title: 'Carta excluída',
        description: 'Carta de referência excluída com sucesso!',
      });
      onUpdate();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir carta',
        description: 'Erro ao excluir carta de referência. Tente novamente.',
      });
      setDeleteDialogOpen(false);
      setLetterToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <CertificateIcon size={20} className="text-amber-600" />
            <span className="text-sm font-medium text-gray-700">
              Cartas de Referência
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Recomendações de empregadores anteriores
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => handleOpenDialog()}
        >
          <PlusIcon size={16} className="mr-2" />
          Adicionar
        </Button>
      </div>

      <div className="space-y-3">
        {referenceLetters.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center text-gray-500">
            <CertificateIcon
              size={48}
              className="mx-auto mb-2 opacity-30"
            />
            <p className="text-sm">Nenhuma carta de referência adicionada</p>
            <p className="text-xs">
              Adicione cartas de recomendação de empregadores anteriores
            </p>
          </div>
        ) : (
          referenceLetters.map((letter) => {
            const [name, company] = letter.identifier.split(' | ');
            return (
              <div
                key={letter.id}
                className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-gray-50"
              >
                <div className="shrink-0 rounded-lg bg-amber-50 p-2">
                  <UserIcon size={24} className="text-amber-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {name || letter.identifier}
                  </h3>
                  {(company || letter.institutionName) && (
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                      <BriefcaseIcon size={14} />
                      <span>{company || letter.institutionName}</span>
                    </div>
                  )}
                  {letter.issuedBy && (
                    <p className="mt-1 text-sm text-gray-600">
                      {letter.issuedBy}
                    </p>
                  )}
                  {letter.stateIssued && (
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                      <PhoneIcon size={14} />
                      <span>{letter.stateIssued}</span>
                    </div>
                  )}
                  {letter.fileUrl && (
                    <button
                      type="button"
                      onClick={async () => {
                        const url = await getPrivateFileUrl(letter.fileUrl!);
                        if (url) window.open(url, '_blank');
                      }}
                      className="mt-2 inline-block text-xs text-amber-600 hover:text-amber-800"
                    >
                      Ver carta de referência →
                    </button>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(letter)}
                  >
                    <PencilSimpleIcon size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(letter.id)}
                  >
                    <TrashIcon size={16} className="text-red-500" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingLetter
                ? 'Editar Carta de Referência'
                : 'Adicionar Carta de Referência'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações sobre o recomendador
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="referrerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do recomendador</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referrerCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Empresa <span className="text-gray-400">(opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Hospital São Paulo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referrerPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cargo do recomendador{' '}
                      <span className="text-gray-400">(opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Supervisor de Enfermagem"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referrerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Telefone para contato{' '}
                      <span className="text-gray-400">(opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        {...field}
                        onChange={(e) => {
                          const masked = maskPhone(e.target.value);
                          form.setValue('referrerPhone', masked);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Relacionamento{' '}
                      <span className="text-gray-400">(opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Ex-supervisor, Ex-colega"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Observações{' '}
                      <span className="text-gray-400">(opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informações adicionais sobre a referência"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Arquivo da carta
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={handleFileSelect}
                    />
                    <div className="flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50">
                      <UploadSimpleIcon size={18} className="mr-2" />
                      <span className="text-sm">
                        {selectedFile
                          ? selectedFile.name
                          : editingLetter?.fileUrl
                            ? 'Alterar arquivo'
                            : 'Selecionar arquivo'}
                      </span>
                    </div>
                  </label>
                </div>
                {uploadError && (
                  <p className="mt-1 text-sm text-red-600">{uploadError}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  PDF, JPG ou PNG. Máximo 10MB
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? 'Salvando...'
                    : editingLetter
                      ? 'Salvar'
                      : 'Adicionar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta carta de referência? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
