'use client';

import { Button } from '@/components/ui/button';
import { FileTextIcon, TrashIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { useRef, useState } from 'react';
import { getPrivateFileUrl } from '@/lib/supabase/storage/client';

interface ResumeUploadFieldProps {
  resumeFile: File | null;
  resumeFileName?: string;
  existingResumeUrl?: string;
  onResumeChange: (file: File | null, fileName?: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export function ResumeUploadField({
  resumeFile,
  resumeFileName,
  existingResumeUrl,
  onResumeChange,
}: ResumeUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  const handleViewResume = async () => {
    if (!existingResumeUrl) return;

    setIsLoadingUrl(true);
    try {
      const url = await getPrivateFileUrl(existingResumeUrl, 'documents');
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error getting resume URL:', error);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Por favor, selecione um arquivo PDF, JPG ou PNG');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert('O arquivo deve ter no máximo 5MB');
      return;
    }

    onResumeChange(file, file.name);
  };

  const handleRemove = () => {
    onResumeChange(null, undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Show existing resume if no new file is selected */}
      {!resumeFile && !resumeFileName && existingResumeUrl ? (
        <div className="rounded-lg border border-gray-300 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <FileTextIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Currículo atual</p>
                <button
                  type="button"
                  onClick={handleViewResume}
                  disabled={isLoadingUrl}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
                >
                  {isLoadingUrl ? 'Carregando...' : 'Ver currículo'}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-700"
              >
                Substituir
              </Button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : !resumeFile && !resumeFileName ? (
        <div
          className="group cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition-colors hover:border-gray-400 hover:bg-gray-100"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-gray-200 p-3">
              <UploadSimpleIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Envie o arquivo do currículo
              </p>
              <p className="mt-1 text-sm text-gray-600">
                PDF, JPG ou PNG até 5MB
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Selecionar arquivo
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-300 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-100 p-2">
                <FileTextIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">
                  {resumeFileName || 'Currículo enviado'}
                </p>
                {resumeFile ? (
                  <p className="text-sm text-gray-500">
                    {`${(resumeFile.size / 1024).toFixed(1)} KB`}
                  </p>
                ) : existingResumeUrl ? (
                  <button
                    type="button"
                    onClick={handleViewResume}
                    disabled={isLoadingUrl}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
                  >
                    {isLoadingUrl ? 'Carregando...' : 'Ver currículo'}
                  </button>
                ) : (
                  <p className="text-sm text-gray-500">Arquivo enviado</p>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <TrashIcon className="size-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
