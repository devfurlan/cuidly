'use client';

import {
  PiCalendar,
  PiPencilSimple,
  PiPlus,
  PiTrash,
  PiUpload,
} from 'react-icons/pi';

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
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { FieldDescription, FieldError } from '@/components/ui/shadcn/field';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/shadcn/form';
import { Input } from '@/components/ui/shadcn/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/shadcn/tooltip';
import { maskDate, parseDateToISO } from '@/helpers/formatters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
  nannyId: number;
  certificates: Certificate[];
  onUpdate: () => void | Promise<void>;
}

const CERTIFICATE_TYPE_LABELS: Record<string, string> = {
  GRADUATION: 'Graduação',
  TECHNICAL: 'Técnico',
  SPECIALIZATION: 'Especialização',
  OTHER: 'Outro',
};

export function CertificateSection({
  nannyId,
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
  const [loadingCertificateId, setLoadingCertificateId] = useState<
    number | null
  >(null);

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
        certificateType:
          certificate.certificateType as CertificateFormData['certificateType'],
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
      formData.append('nannyId', String(nannyId));
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
        ? `/api/nannies/documents/${editingCertificate.id}`
        : '/api/nannies/documents';

      const response = await fetch(url, {
        method: editingCertificate ? 'PUT' : 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar certificado');
      }

      handleCloseDialog();
      toast.success(
        editingCertificate
          ? 'Certificado atualizado com sucesso!'
          : 'Certificado adicionado com sucesso!',
      );
      await onUpdate();
    } catch (error) {
      console.error('Error saving certificate:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar certificado. Tente novamente.',
      );
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
        `/api/nannies/documents/${certificateToDelete}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('Erro ao excluir certificado');
      }

      setDeleteDialogOpen(false);
      setCertificateToDelete(null);
      toast.success('Certificado excluído com sucesso!');
      await onUpdate();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erro ao excluir certificado. Tente novamente.');
      setDeleteDialogOpen(false);
      setCertificateToDelete(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleViewCertificate = async (certificateId: number) => {
    setLoadingCertificateId(certificateId);
    try {
      const response = await fetch(
        `/api/nannies/documents/${certificateId}/signed-url`,
      );
      if (!response.ok) {
        throw new Error('Erro ao carregar documento');
      }
      const data = await response.json();
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error getting signed URL:', error);
      toast.error('Erro ao abrir o certificado. Tente novamente.');
    } finally {
      setLoadingCertificateId(null);
    }
  };

  return (
    <>
      {certificates.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-sm text-gray-400 italic">
            Nenhum certificado adicionado ainda.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Adicione seus certificados de formação e cursos profissionais.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => handleOpenDialog()}
          >
            <PiPlus className="mr-1.5 size-4" />
            Adicionar Certificado
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="flex items-start justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {cert.identifier}
                </p>
                <p className="text-xs text-gray-500">{cert.institutionName}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {CERTIFICATE_TYPE_LABELS[cert.certificateType] ||
                      cert.certificateType}
                  </Badge>
                  {cert.issueDate && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex cursor-default items-center text-xs text-gray-500">
                            <PiCalendar className="mr-1 size-3" />
                            {formatDate(cert.issueDate)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Data de conclusão</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                {cert.fileUrl && (
                  <button
                    type="button"
                    onClick={() => handleViewCertificate(cert.id)}
                    disabled={loadingCertificateId === cert.id}
                    className="mt-1.5 text-xs text-fuchsia-600 hover:text-fuchsia-800 disabled:opacity-50"
                  >
                    {loadingCertificateId === cert.id
                      ? 'Carregando...'
                      : 'Ver certificado'}
                  </button>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleOpenDialog(cert)}
                >
                  <PiPencilSimple className="size-4 text-gray-500" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDeleteClick(cert.id)}
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
            Adicionar Certificado
          </Button>
        </div>
      )}

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
                      <PiUpload size={18} className="mr-2" />
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
                  <FieldError className="mt-1">{uploadError}</FieldError>
                )}
                <FieldDescription className="mt-1">
                  PDF, JPG ou PNG. Máximo 10MB
                </FieldDescription>
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
    </>
  );
}
