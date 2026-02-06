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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { getPrivateFileUrl } from '@/lib/supabase/storage/client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarIcon,
  CertificateIcon,
  GraduationCapIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  UploadSimpleIcon,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Certificate form schema
const certificateSchema = z.object({
  courseName: z.string().min(1, 'Nome do curso é obrigatório'),
  institutionName: z.string().min(1, 'Nome da instituição é obrigatório'),
  certificateType: z.enum(
    ['GRADUATION', 'TECHNICAL', 'SPECIALIZATION', 'OTHER'],
    {
      required_error: 'Selecione o tipo de certificado',
    },
  ),
  issueDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{2}\/\d{2}\/\d{4}$/.test(val),
      'Data inválida (DD/MM/AAAA)',
    ),
  file: z.any().optional(),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

interface Certificate {
  id: number;
  identifier: string;
  institutionName: string;
  certificateType: string;
  issueDate?: string;
  fileUrl?: string;
}

interface CertificateSectionProps {
  partnerId: number;
  certificates: Certificate[];
  onUpdate: () => void;
}

const CERTIFICATE_TYPE_LABELS: Record<string, string> = {
  GRADUATION: 'Graduação',
  TECHNICAL: 'Técnico',
  SPECIALIZATION: 'Especialização',
  OTHER: 'Outro',
};

// Date mask function
const maskDate = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
};

// Parse date to ISO format
const parseDateToISO = (dateStr: string): string => {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
};

export function CertificateSection({
  partnerId,
  certificates,
  onUpdate,
}: CertificateSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] =
    useState<Certificate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState<number | null>(
    null,
  );
  const { toast } = useToast();

  const form = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      courseName: '',
      institutionName: '',
      certificateType: undefined,
      issueDate: '',
    },
  });

  const handleOpenDialog = (certificate?: Certificate) => {
    if (certificate) {
      setEditingCertificate(certificate);
      form.reset({
        courseName: certificate.identifier,
        institutionName: certificate.institutionName,
        certificateType: certificate.certificateType as any,
        issueDate: certificate.issueDate
          ? new Date(certificate.issueDate).toLocaleDateString('pt-BR')
          : '',
      });
    } else {
      setEditingCertificate(null);
      form.reset({
        courseName: '',
        institutionName: '',
        certificateType: undefined,
        issueDate: '',
      });
    }
    setSelectedFile(null);
    setUploadError(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCertificate(null);
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

  const onSubmit = async (data: CertificateFormData) => {
    // Validate file is required (for new certificates or if editing without existing file)
    const hasExistingFile = editingCertificate?.fileUrl;
    if (!selectedFile && !hasExistingFile) {
      // File validation already shown by form onSubmit handler
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('partnerId', String(partnerId));
      formData.append('courseName', data.courseName);
      formData.append('institutionName', data.institutionName);
      formData.append('certificateType', data.certificateType);
      if (data.issueDate) {
        formData.append('issueDate', parseDateToISO(data.issueDate));
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const url = editingCertificate
        ? `/api/partners/documents/${editingCertificate.id}`
        : '/api/partners/documents/certificate';

      const response = await fetch(url, {
        method: editingCertificate ? 'PUT' : 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar certificado');
      }

      handleCloseDialog();
      toast({
        variant: 'success',
        title: editingCertificate
          ? 'Certificado atualizado'
          : 'Certificado adicionado',
        description: editingCertificate
          ? 'Certificado atualizado com sucesso!'
          : 'Certificado adicionado com sucesso!',
      });
      onUpdate();
    } catch (error) {
      console.error('Error saving certificate:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar certificado',
        description:
          error instanceof Error
            ? error.message
            : 'Erro ao salvar certificado. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (certificateId: number) => {
    setCertificateToDelete(certificateId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!certificateToDelete) return;

    try {
      const response = await fetch(
        `/api/partners/documents/${certificateToDelete}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('Erro ao excluir certificado');
      }

      setDeleteDialogOpen(false);
      setCertificateToDelete(null);
      toast({
        variant: 'success',
        title: 'Certificado excluído',
        description: 'Certificado excluído com sucesso!',
      });
      onUpdate();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir certificado',
        description: 'Erro ao excluir certificado. Tente novamente.',
      });
      setDeleteDialogOpen(false);
      setCertificateToDelete(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <CertificateIcon size={20} className="text-purple-600" />
            <span className="text-sm font-medium text-gray-700">
              Certificados
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Formação acadêmica e cursos profissionais
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
        {certificates.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center text-gray-500">
            <CertificateIcon size={48} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum certificado adicionado</p>
            <p className="text-xs">
              Adicione seus certificados de formação e cursos profissionais
            </p>
          </div>
        ) : (
          certificates.map((cert) => (
            <div
              key={cert.id}
              className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-gray-50"
            >
              <div className="shrink-0 rounded-lg bg-purple-50 p-2">
                <GraduationCapIcon size={24} className="text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900">
                  {cert.identifier}
                </h3>
                <p className="text-sm text-gray-600">{cert.institutionName}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="purple" type="soft" size="sm">
                    {CERTIFICATE_TYPE_LABELS[cert.certificateType] ||
                      cert.certificateType}
                  </Badge>
                  {cert.issueDate && (
                    <span className="flex items-center text-xs text-gray-500">
                      <CalendarIcon size={14} className="mr-1" />
                      {formatDate(cert.issueDate)}
                    </span>
                  )}
                </div>
                {cert.fileUrl && (
                  <button
                    type="button"
                    onClick={async () => {
                      const url = await getPrivateFileUrl(cert.fileUrl!);
                      if (url) window.open(url, '_blank');
                    }}
                    className="mt-2 inline-block text-xs text-purple-600 hover:text-purple-800"
                  >
                    Ver certificado →
                  </button>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(cert)}
                >
                  <PencilSimpleIcon size={16} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(cert.id)}
                >
                  <TrashIcon size={16} className="text-red-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCertificate
                ? 'Editar Certificado'
                : 'Adicionar Certificado'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do certificado ou formação
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={(e) => {
                // Validate file alongside form validation
                const hasExistingFile = editingCertificate?.fileUrl;
                if (!selectedFile && !hasExistingFile) {
                  setUploadError('O arquivo do certificado é obrigatório');
                } else {
                  setUploadError(null);
                }
                form.handleSubmit(onSubmit)(e);
              }}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="courseName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do curso</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Curso de Primeiros Socorros"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="institutionName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instituição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: SENAC São Paulo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="certificateType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GRADUATION">Graduação</SelectItem>
                        <SelectItem value="TECHNICAL">Técnico</SelectItem>
                        <SelectItem value="SPECIALIZATION">
                          Especialização
                        </SelectItem>
                        <SelectItem value="OTHER">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Data de conclusão{' '}
                      <span className="text-gray-400">(opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="DD/MM/AAAA"
                        {...field}
                        onChange={(e) => {
                          const masked = maskDate(e.target.value);
                          form.setValue('issueDate', masked);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${uploadError ? 'text-destructive' : 'text-gray-700'}`}
                >
                  Arquivo do certificado
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={handleFileSelect}
                    />
                    <div
                      className={`flex items-center justify-center rounded-md border px-4 py-2 transition-colors hover:bg-gray-50 ${uploadError ? 'border-destructive' : 'border-gray-300'}`}
                    >
                      <UploadSimpleIcon size={18} className="mr-2" />
                      <span className="text-sm">
                        {selectedFile
                          ? selectedFile.name
                          : editingCertificate?.fileUrl
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
                    : editingCertificate
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
              Tem certeza que deseja excluir este certificado? Esta ação não
              pode ser desfeita.
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
