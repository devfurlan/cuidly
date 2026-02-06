'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
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
import {
  FileTextIcon,
  TrashIcon,
  UploadSimpleIcon,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { getPrivateFileUrl } from '@/lib/supabase/storage/client';

interface Document {
  id: number;
  documentType: 'PROOF_OF_ADDRESS';
  identifier: string;
  fileUrl?: string;
}

interface ProofOfAddressUploadProps {
  partnerId: number;
  document?: Document;
  onUpdate: () => void;
}

export function ProofOfAddressUpload({
  partnerId,
  document,
  onUpdate,
}: ProofOfAddressUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Tipo de arquivo inválido',
        description: `Arquivo selecionado: ${file.type}. Use PDF, JPG, PNG ou WEBP`,
      });
      e.target.value = '';
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Arquivo muito grande',
        description: 'Tamanho máximo: 10MB',
      });
      e.target.value = '';
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'PROOF_OF_ADDRESS');
      formData.append('partnerId', String(partnerId));

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
        title: 'Comprovante enviado',
        description: 'Comprovante de residência enviado com sucesso!',
      });
      onUpdate();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar comprovante',
        description:
          error instanceof Error
            ? error.message
            : 'Erro ao enviar comprovante. Tente novamente.',
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!document) return;

    try {
      const response = await fetch(`/api/partners/documents/${document.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir comprovante');
      }

      setDeleteDialogOpen(false);
      toast({
        variant: 'success',
        title: 'Comprovante excluído',
        description: 'Comprovante excluído com sucesso!',
      });
      onUpdate();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir comprovante',
        description: 'Erro ao excluir comprovante. Tente novamente.',
      });
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2">
          <span className="text-sm font-medium text-gray-700">Comprovante de Residência </span>
          <span className="text-xs text-gray-400">(opcional)</span>
        </div>
        <p className="mb-3 text-xs text-gray-500">
          Conta de luz, água, gás, telefone ou contrato de aluguel (últimos 3
          meses)
        </p>

        {document ? (
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-2">
                  <FileTextIcon size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Comprovante de residência
                  </p>
                  {document.fileUrl && (
                    <button
                      type="button"
                      onClick={async () => {
                        const url = await getPrivateFileUrl(document.fileUrl!);
                        if (url) window.open(url, '_blank');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Ver comprovante
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isUploading}
                    asChild
                  >
                    <span>
                      <UploadSimpleIcon size={16} className="mr-2" />
                      Substituir
                    </span>
                  </Button>
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteClick}
                  disabled={isUploading}
                >
                  <TrashIcon size={16} className="text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400">
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              <div className="flex flex-col items-center">
                <UploadSimpleIcon size={32} className="mb-2 text-gray-400" />
                <p className="mb-1 text-sm font-medium text-gray-700">
                  {isUploading
                    ? 'Enviando...'
                    : 'Clique para selecionar o arquivo'}
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG ou PNG. Máximo 10MB
                </p>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este comprovante de residência? Esta ação não pode ser desfeita.
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
