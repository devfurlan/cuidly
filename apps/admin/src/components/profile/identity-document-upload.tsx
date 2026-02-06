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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { getPrivateFileUrl } from '@/lib/supabase/storage/client';
import { maskDate, parseDateToISO } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  PencilSimpleIcon,
  FileTextIcon,
  TrashIcon,
  UploadSimpleIcon,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface Document {
  id: number;
  documentType: 'RG' | 'CNH';
  identifier: string;
  issuedBy?: string;
  stateIssued?: string;
  issueDate?: string;
  expirationDate?: string;
  fileUrl?: string;
  backFileUrl?: string;
}

interface IdentityDocumentUploadProps {
  partnerId: number;
  documents?: Document[];
  onUpdate: () => void;
}

const rgSchema = z.object({
  documentType: z.literal('RG'),
  identifier: z.string().min(1, 'Número do RG é obrigatório'),
  issuedBy: z.string().min(1, 'Órgão emissor é obrigatório'),
  stateIssued: z.string().length(2, 'UF deve ter 2 caracteres').toUpperCase(),
  issueDate: z
    .string()
    .min(1, 'Data de emissão é obrigatória')
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data inválida'),
  frontFile: z.instanceof(File).optional(),
  backFile: z.instanceof(File).optional(),
});

const cnhSchema = z.object({
  documentType: z.literal('CNH'),
  identifier: z.string().min(1, 'Número da CNH é obrigatório'),
  issueDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{2}\/\d{2}\/\d{4}$/.test(val),
      'Data inválida',
    ),
  expirationDate: z
    .string()
    .min(1, 'Data de validade é obrigatória')
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data inválida'),
  file: z.instanceof(File).optional(),
});

type RGFormData = z.infer<typeof rgSchema>;
type CNHFormData = z.infer<typeof cnhSchema>;

export function IdentityDocumentUpload({
  partnerId,
  documents = [],
  onUpdate,
}: IdentityDocumentUploadProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<'RG' | 'CNH' | null>(
    null,
  );
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const rgForm = useForm<RGFormData>({
    resolver: zodResolver(rgSchema),
    defaultValues: {
      documentType: 'RG',
      identifier: '',
      issuedBy: '',
      stateIssued: '',
      issueDate: '',
    },
  });

  const cnhForm = useForm<CNHFormData>({
    resolver: zodResolver(cnhSchema),
    defaultValues: {
      documentType: 'CNH',
      identifier: '',
      issueDate: '',
      expirationDate: '',
    },
  });

  const rgDoc = documents.find((d) => d.documentType === 'RG');
  const cnhDoc = documents.find((d) => d.documentType === 'CNH');

  const handleUploadClick = (docType: 'RG' | 'CNH') => {
    setSelectedDocType(docType);
    setUploadDialogOpen(true);
    if (docType === 'RG') {
      rgForm.reset({
        documentType: 'RG',
        identifier: '',
        issuedBy: '',
        stateIssued: '',
        issueDate: '',
      });
    } else {
      cnhForm.reset({
        documentType: 'CNH',
        identifier: '',
        issueDate: '',
        expirationDate: '',
      });
    }
  };

  const handleEditClick = (document: Document) => {
    setSelectedDocument(document);
    setSelectedDocType(document.documentType);
    setEditDialogOpen(true);
    if (document.documentType === 'RG') {
      rgForm.reset({
        documentType: 'RG',
        identifier: document.identifier,
        issuedBy: document.issuedBy || '',
        stateIssued: document.stateIssued || '',
        issueDate: document.issueDate
          ? new Date(document.issueDate).toLocaleDateString('pt-BR')
          : '',
      });
    } else {
      cnhForm.reset({
        documentType: 'CNH',
        identifier: document.identifier,
        issueDate: document.issueDate
          ? new Date(document.issueDate).toLocaleDateString('pt-BR')
          : '',
        expirationDate: document.expirationDate
          ? new Date(document.expirationDate).toLocaleDateString('pt-BR')
          : '',
      });
    }
  };

  const handleDeleteClick = (document: Document) => {
    setSelectedDocument(document);
    setDeleteDialogOpen(true);
  };

  const handleUploadSubmit = async (data: RGFormData | CNHFormData) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('documentType', data.documentType);
      formData.append('identifier', data.identifier);
      formData.append('partnerId', String(partnerId));

      if (data.documentType === 'RG') {
        const rgData = data as RGFormData;
        formData.append('issuedBy', rgData.issuedBy);
        formData.append('stateIssued', rgData.stateIssued.toUpperCase());
        formData.append('issueDate', parseDateToISO(rgData.issueDate));

        if (rgData.frontFile) {
          formData.append('file', rgData.frontFile);
        }
        if (rgData.backFile) {
          formData.append('backFile', rgData.backFile);
        }
      } else {
        const cnhData = data as CNHFormData;
        if (cnhData.issueDate) {
          formData.append('issueDate', parseDateToISO(cnhData.issueDate));
        }
        formData.append(
          'expirationDate',
          parseDateToISO(cnhData.expirationDate),
        );

        if (cnhData.file) {
          formData.append('file', cnhData.file);
        }
      }

      const response = await fetch('/api/partners/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer upload');
      }

      toast({
        variant: 'success',
        title: 'Documento enviado',
        description: `${data.documentType} enviado com sucesso!`,
      });
      setUploadDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar documento',
        description:
          error instanceof Error
            ? error.message
            : 'Erro ao enviar documento. Tente novamente.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditSubmit = async (data: RGFormData | CNHFormData) => {
    if (!selectedDocument) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('identifier', data.identifier);

      if (data.documentType === 'RG') {
        const rgData = data as RGFormData;
        formData.append('issuedBy', rgData.issuedBy);
        formData.append('stateIssued', rgData.stateIssued.toUpperCase());
        formData.append('issueDate', parseDateToISO(rgData.issueDate));

        if (rgData.frontFile) {
          formData.append('file', rgData.frontFile);
        }
        if (rgData.backFile) {
          formData.append('backFile', rgData.backFile);
        }
      } else {
        const cnhData = data as CNHFormData;
        if (cnhData.issueDate) {
          formData.append('issueDate', parseDateToISO(cnhData.issueDate));
        }
        formData.append(
          'expirationDate',
          parseDateToISO(cnhData.expirationDate),
        );

        if (cnhData.file) {
          formData.append('file', cnhData.file);
        }
      }

      const response = await fetch(
        `/api/partners/documents/${selectedDocument.id}`,
        {
          method: 'PATCH',
          body: formData,
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar documento');
      }

      toast({
        variant: 'success',
        title: 'Documento atualizado',
        description: `${data.documentType} atualizado com sucesso!`,
      });
      setEditDialogOpen(false);
      setSelectedDocument(null);
      onUpdate();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar documento',
        description:
          error instanceof Error
            ? error.message
            : 'Erro ao atualizar documento. Tente novamente.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDocument) return;

    try {
      const response = await fetch(
        `/api/partners/documents/${selectedDocument.id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('Erro ao excluir documento');
      }

      setDeleteDialogOpen(false);
      setSelectedDocument(null);
      toast({
        variant: 'success',
        title: 'Documento excluído',
        description: 'Documento excluído com sucesso!',
      });
      onUpdate();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir documento',
        description: 'Erro ao excluir documento. Tente novamente.',
      });
      setDeleteDialogOpen(false);
    }
  };

  const validateFile = (file: File | undefined, fieldName: string) => {
    if (!file) return true;

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Tipo de arquivo inválido',
        description: `${fieldName}: Use apenas JPG, PNG, WEBP ou PDF`,
      });
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Arquivo muito grande',
        description: `${fieldName}: Tamanho máximo de 10MB`,
      });
      return false;
    }

    return true;
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2">
          <span className="text-sm font-medium text-gray-700">
            Documentos de Identificação
          </span>
        </div>
        <p className="mb-2 text-xs text-gray-500">
          RG ou CNH para verificação de identidade
        </p>

        {/* RG Section */}
        <div className="mb-3">
          {rgDoc ? (
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-50 p-2">
                    <FileTextIcon size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      RG: {rgDoc.identifier}
                    </p>
                    {rgDoc.issuedBy && (
                      <p className="text-xs text-gray-600">
                        Emissor: {rgDoc.issuedBy} - {rgDoc.stateIssued}
                      </p>
                    )}
                    {rgDoc.issueDate && (
                      <p className="text-xs text-gray-600">
                        Emissão:{' '}
                        {new Date(rgDoc.issueDate).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    <div className="mt-1 flex gap-2 text-xs">
                      {rgDoc.fileUrl && (
                        <button
                          type="button"
                          onClick={async () => {
                            const url = await getPrivateFileUrl(rgDoc.fileUrl!);
                            if (url) window.open(url, '_blank');
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Ver frente →
                        </button>
                      )}
                      {rgDoc.backFileUrl && (
                        <button
                          type="button"
                          onClick={async () => {
                            const url = await getPrivateFileUrl(
                              rgDoc.backFileUrl!,
                            );
                            if (url) window.open(url, '_blank');
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Ver verso →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEditClick(rgDoc)}
                  >
                    <PencilSimpleIcon />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(rgDoc)}
                  >
                    <TrashIcon size={16} className="text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleUploadClick('RG')}
              className="w-full"
            >
              <UploadSimpleIcon size={16} className="mr-2" />
              Enviar RG
            </Button>
          )}
        </div>

        {/* CNH Section */}
        <div>
          {cnhDoc ? (
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-50 p-2">
                    <FileTextIcon size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      CNH: {cnhDoc.identifier}
                    </p>
                    {cnhDoc.expirationDate && (
                      <p className="text-xs text-gray-600">
                        Validade:{' '}
                        {new Date(cnhDoc.expirationDate).toLocaleDateString(
                          'pt-BR',
                        )}
                      </p>
                    )}
                    {cnhDoc.issueDate && (
                      <p className="text-xs text-gray-600">
                        Emissão:{' '}
                        {new Date(cnhDoc.issueDate).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {cnhDoc.fileUrl && (
                      <button
                        type="button"
                        onClick={async () => {
                          const url = await getPrivateFileUrl(cnhDoc.fileUrl!);
                          if (url) window.open(url, '_blank');
                        }}
                        className="mt-1 inline-block text-xs text-blue-600 hover:text-blue-800"
                      >
                        Ver documento →
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditClick(cnhDoc)}
                  >
                    <PencilSimpleIcon size={16} className="mr-2" />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(cnhDoc)}
                  >
                    <TrashIcon size={16} className="text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleUploadClick('CNH')}
              className="w-full"
            >
              <UploadSimpleIcon size={16} className="mr-2" />
              Enviar CNH
            </Button>
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar {selectedDocType}</DialogTitle>
            <DialogDescription>
              Preencha as informações do documento
            </DialogDescription>
          </DialogHeader>

          {selectedDocType === 'RG' ? (
            <form
              onSubmit={rgForm.handleSubmit(handleUploadSubmit)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="rg-identifier">Número do RG</Label>
                <Input
                  id="rg-identifier"
                  {...rgForm.register('identifier')}
                  placeholder="Ex: 12.345.678-9"
                />
                {rgForm.formState.errors.identifier && (
                  <p className="mt-1 text-xs text-red-600">
                    {rgForm.formState.errors.identifier.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="rg-issuedBy">Órgão emissor</Label>
                <Input
                  id="rg-issuedBy"
                  {...rgForm.register('issuedBy')}
                  placeholder="Ex: SSP"
                />
                {rgForm.formState.errors.issuedBy && (
                  <p className="mt-1 text-xs text-red-600">
                    {rgForm.formState.errors.issuedBy.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="rg-stateIssued">UF de emissão</Label>
                <Input
                  id="rg-stateIssued"
                  {...rgForm.register('stateIssued')}
                  placeholder="Ex: SP"
                  maxLength={2}
                  onChange={(e) => {
                    rgForm.setValue(
                      'stateIssued',
                      e.target.value.toUpperCase(),
                    );
                  }}
                />
                {rgForm.formState.errors.stateIssued && (
                  <p className="mt-1 text-xs text-red-600">
                    {rgForm.formState.errors.stateIssued.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="rg-issueDate">Data de emissão</Label>
                <Input
                  id="rg-issueDate"
                  placeholder="DD/MM/AAAA"
                  value={rgForm.watch('issueDate') || ''}
                  onChange={(e) => {
                    const masked = maskDate(e.target.value);
                    rgForm.setValue('issueDate', masked);
                  }}
                />
                {rgForm.formState.errors.issueDate && (
                  <p className="mt-1 text-xs text-red-600">
                    {rgForm.formState.errors.issueDate.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="rg-front">Foto da Frente</Label>
                <Input
                  id="rg-front"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && validateFile(file, 'Frente do RG')) {
                      rgForm.setValue('frontFile', file);
                    }
                  }}
                />
              </div>

              <div>
                <Label htmlFor="rg-back">Foto do Verso</Label>
                <Input
                  id="rg-back"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && validateFile(file, 'Verso do RG')) {
                      rgForm.setValue('backFile', file);
                    }
                  }}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadDialogOpen(false)}
                  disabled={isUploading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'Enviando...' : 'Enviar'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form
              onSubmit={cnhForm.handleSubmit(handleUploadSubmit)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="cnh-identifier">Número da CNH</Label>
                <Input
                  id="cnh-identifier"
                  {...cnhForm.register('identifier')}
                  placeholder="Ex: 12345678900"
                />
                {cnhForm.formState.errors.identifier && (
                  <p className="mt-1 text-xs text-red-600">
                    {cnhForm.formState.errors.identifier.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="cnh-issueDate">
                  Data de emissão (opcional)
                </Label>
                <Input
                  id="cnh-issueDate"
                  placeholder="DD/MM/AAAA"
                  value={cnhForm.watch('issueDate') || ''}
                  onChange={(e) => {
                    const masked = maskDate(e.target.value);
                    cnhForm.setValue('issueDate', masked);
                  }}
                />
                {cnhForm.formState.errors.issueDate && (
                  <p className="mt-1 text-xs text-red-600">
                    {cnhForm.formState.errors.issueDate.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="cnh-expirationDate">Data de validade</Label>
                <Input
                  id="cnh-expirationDate"
                  placeholder="DD/MM/AAAA"
                  value={cnhForm.watch('expirationDate') || ''}
                  onChange={(e) => {
                    const masked = maskDate(e.target.value);
                    cnhForm.setValue('expirationDate', masked);
                  }}
                />
                {cnhForm.formState.errors.expirationDate && (
                  <p className="mt-1 text-xs text-red-600">
                    {cnhForm.formState.errors.expirationDate.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="cnh-file">Foto da CNH</Label>
                <Input
                  id="cnh-file"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && validateFile(file, 'CNH')) {
                      cnhForm.setValue('file', file);
                    }
                  }}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadDialogOpen(false)}
                  disabled={isUploading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'Enviando...' : 'Enviar'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar {selectedDocType}</DialogTitle>
            <DialogDescription>
              Atualize as informações do documento
            </DialogDescription>
          </DialogHeader>

          {selectedDocType === 'RG' ? (
            <form
              onSubmit={rgForm.handleSubmit(handleEditSubmit)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="edit-rg-identifier">Número do RG</Label>
                <Input
                  id="edit-rg-identifier"
                  {...rgForm.register('identifier')}
                  placeholder="Ex: 12.345.678-9"
                />
                {rgForm.formState.errors.identifier && (
                  <p className="mt-1 text-xs text-red-600">
                    {rgForm.formState.errors.identifier.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-rg-issuedBy">Órgão emissor</Label>
                <Input
                  id="edit-rg-issuedBy"
                  {...rgForm.register('issuedBy')}
                  placeholder="Ex: SSP"
                />
                {rgForm.formState.errors.issuedBy && (
                  <p className="mt-1 text-xs text-red-600">
                    {rgForm.formState.errors.issuedBy.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-rg-stateIssued">UF de emissão</Label>
                <Input
                  id="edit-rg-stateIssued"
                  {...rgForm.register('stateIssued')}
                  placeholder="Ex: SP"
                  maxLength={2}
                  onChange={(e) => {
                    rgForm.setValue(
                      'stateIssued',
                      e.target.value.toUpperCase(),
                    );
                  }}
                />
                {rgForm.formState.errors.stateIssued && (
                  <p className="mt-1 text-xs text-red-600">
                    {rgForm.formState.errors.stateIssued.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-rg-issueDate">Data de emissão</Label>
                <Input
                  id="edit-rg-issueDate"
                  placeholder="DD/MM/AAAA"
                  value={rgForm.watch('issueDate') || ''}
                  onChange={(e) => {
                    const masked = maskDate(e.target.value);
                    rgForm.setValue('issueDate', masked);
                  }}
                />
                {rgForm.formState.errors.issueDate && (
                  <p className="mt-1 text-xs text-red-600">
                    {rgForm.formState.errors.issueDate.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-rg-front">
                  Nova Foto da Frente (opcional)
                </Label>
                <Input
                  id="edit-rg-front"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && validateFile(file, 'Frente do RG')) {
                      rgForm.setValue('frontFile', file);
                    }
                  }}
                />
              </div>

              <div>
                <Label htmlFor="edit-rg-back">
                  Nova Foto do Verso (opcional)
                </Label>
                <Input
                  id="edit-rg-back"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && validateFile(file, 'Verso do RG')) {
                      rgForm.setValue('backFile', file);
                    }
                  }}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={isUploading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form
              onSubmit={cnhForm.handleSubmit(handleEditSubmit)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="edit-cnh-identifier">Número da CNH</Label>
                <Input
                  id="edit-cnh-identifier"
                  {...cnhForm.register('identifier')}
                  placeholder="Ex: 12345678900"
                />
                {cnhForm.formState.errors.identifier && (
                  <p className="mt-1 text-xs text-red-600">
                    {cnhForm.formState.errors.identifier.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-cnh-issueDate">
                  Data de emissão (opcional)
                </Label>
                <Input
                  id="edit-cnh-issueDate"
                  placeholder="DD/MM/AAAA"
                  value={cnhForm.watch('issueDate') || ''}
                  onChange={(e) => {
                    const masked = maskDate(e.target.value);
                    cnhForm.setValue('issueDate', masked);
                  }}
                />
                {cnhForm.formState.errors.issueDate && (
                  <p className="mt-1 text-xs text-red-600">
                    {cnhForm.formState.errors.issueDate.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-cnh-expirationDate">
                  Data de validade
                </Label>
                <Input
                  id="edit-cnh-expirationDate"
                  placeholder="DD/MM/AAAA"
                  value={cnhForm.watch('expirationDate') || ''}
                  onChange={(e) => {
                    const masked = maskDate(e.target.value);
                    cnhForm.setValue('expirationDate', masked);
                  }}
                />
                {cnhForm.formState.errors.expirationDate && (
                  <p className="mt-1 text-xs text-red-600">
                    {cnhForm.formState.errors.expirationDate.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-cnh-file">
                  Nova Foto da CNH (opcional)
                </Label>
                <Input
                  id="edit-cnh-file"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && validateFile(file, 'CNH')) {
                      cnhForm.setValue('file', file);
                    }
                  }}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={isUploading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode
              ser desfeita.
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
