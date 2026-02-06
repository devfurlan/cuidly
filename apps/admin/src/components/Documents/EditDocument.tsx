'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useToast } from '@/hooks/useToast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NannyDocument, NannyDocumentSchema } from './schemas';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ChangeEvent, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { validateImageOrPdfType } from '@/utils/validateFileType';
import { convertBlobUrlToFile } from '@/utils/convertBlobUrlToFile';
import {
  deleteFile,
  getPrivateFileUrl,
  uploadPrivateFile,
} from '@/lib/supabase/storage/client';
import { getDocumentById, updateDocument } from '@/services/documentService';
import { z } from 'zod';
import { parseDateToBR } from '@/utils/parseDateToBR';
import { Document } from '@prisma/client';
import { PencilSimpleIcon, XIcon } from '@phosphor-icons/react';
import { applyDocumentMask } from '@/utils/applyDocumentMask';
import FieldIdentifier from './ui/FieldIdentifier';
import FieldIssuedBy from './ui/FieldIssuedBy';
import FieldStateIssued from './ui/FieldStateIssued';
import FieldIssueDate from './ui/FieldIssueDate';
import FieldExpirationDate from './ui/FieldExpirationDate';

export default function EditDocument({
  documentId,
  isOpen,
  onOpenChange,
  onDocumentUpdated,
}: {
  documentId: number;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDocumentUpdated: () => void;
}) {
  const [documentData, setDocumentData] = useState<Document | null>(null);
  const [documentFileUrl, setDocumentFileUrl] = useState('');
  const [wantEditFile, setWantEditFile] = useState(false);
  const { slug } = useParams();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<NannyDocument>({
    resolver: zodResolver(NannyDocumentSchema),
    defaultValues: async () => {
      const document = await getDocumentById(documentId);

      if (!document) {
        router.push('/404');
        return {} as z.infer<typeof NannyDocumentSchema>;
      }

      setDocumentData(document);

      return {
        documentType: document.documentType,
        identifier: applyDocumentMask(
          document.identifier,
          document.documentType as string,
        ),
        fileUrl: '',
        issuedBy: document.issuedBy,
        stateIssued: document.stateIssued,
        issueDate: document.issueDate
          ? parseDateToBR(document.issueDate.toISOString().split('T')[0])
          : '',
        expirationDate: document.expirationDate
          ? parseDateToBR(document.expirationDate.toISOString().split('T')[0])
          : '',
        validationStatus: document.validationStatus,
        institutionName: document.institutionName || '',
        certificateType: document.certificateType || '',
      } as NannyDocument;
    },
  });

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter((file) => validateImageOrPdfType(file));

      if (validFiles.length !== files.length) {
        toast({
          variant: 'destructive',
          title: 'Erro ao enviar arquivo',
          description:
            'Por favor, envie apenas arquivos validos (JPEG, PNG, ou PDF).',
        });
        return;
      }

      const fileUrls = validFiles.map((file) => URL.createObjectURL(file));
      setDocumentFileUrl(fileUrls.join(','));
    }
  }

  async function onSubmitDocument(data: NannyDocument) {
    let uploadedUrl = '';

    if (wantEditFile && documentData?.fileUrl) {
      const oldFileUrls = documentData.fileUrl.split(',');
      try {
        for (const oldFileUrl of oldFileUrls) {
          const url = await getPrivateFileUrl(oldFileUrl as string);
          if (url) await deleteFile(url, 'private');
        }
      } catch (error) {
        console.error('Error deleting the old files:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao excluir arquivos antigos',
          description: 'Falha ao excluir os arquivos antigos. Tente novamente.',
        });
        return;
      }
    }

    if (documentFileUrl) {
      const fileUrls = documentFileUrl.split(',');
      const uploadedUrls = [];

      for (const fileUrl of fileUrls) {
        const { file } = await convertBlobUrlToFile(fileUrl);
        const { fileUrl: newFileUrl, error } = await uploadPrivateFile({
          file: file,
          folder: `nanny/${slug}/`,
          namePrefix: data.documentType,
        });

        if (error) {
          console.error(error);
          toast({
            variant: 'destructive',
            title: 'Erro ao enviar arquivo',
            description: 'Falha no upload do arquivo. Tente novamente.',
          });
          return;
        }
        uploadedUrls.push(newFileUrl);
      }

      uploadedUrl = uploadedUrls.join(',');
      setDocumentData(
        documentData ? { ...documentData, fileUrl: uploadedUrl } : null,
      );
    }

    try {
      await updateDocument(documentId, data, uploadedUrl);
      toast({ variant: 'success', title: 'Documento editado com sucesso!' });
      onDocumentUpdated();

      const newDocument = {
        documentType: data.documentType ?? undefined,
        identifier: applyDocumentMask(
          data.identifier,
          data.documentType as string,
        ),
        fileUrl: '',
        issuedBy: data.issuedBy ?? '',
        stateIssued: data.stateIssued ?? '',
        issueDate: data.issueDate || '',
        expirationDate: data.expirationDate || '',
        validationStatus: data.validationStatus ?? '',
        institutionName: data.institutionName ?? '',
        certificateType: data.certificateType ?? '',
      };
      form.reset(newDocument);
      setDocumentFileUrl('');
      setWantEditFile(false);
      onOpenChange(false);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao editar documento',
        description: 'Tente novamente.',
      });
    }
  }

  return (
    <Dialog
      key={documentId}
      open={isOpen}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          setDocumentFileUrl('');
          setWantEditFile(false);
          form.reset();
        }
      }}
    >
      <DialogContent
        className="overflow-y-auto sm:max-h-[90vh] sm:min-h-[620px] sm:max-w-[820px]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitDocument)}
            className="h-full sm:flex sm:flex-col"
          >
            <DialogHeader className="shrink-0">
              <DialogTitle>Editar Documento</DialogTitle>
              <DialogDescription>
                Edite o documento da baba.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-1 flex-col gap-4 pb-8 pt-6">
              {!documentData ? (
                <div className="absolute bottom-0 left-0 right-0 top-[90px] z-10 flex items-center justify-center bg-white transition-all duration-300 ease-in-out">
                  <p className="animate-pulse text-sm text-muted-foreground">
                    Carregando documento...
                  </p>
                </div>
              ) : null}

              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.resetField('identifier');
                        form.resetField('issuedBy');
                        form.resetField('stateIssued');
                        form.resetField('issueDate');
                        form.resetField('expirationDate');
                        form.resetField('validationStatus');
                        form.resetField('institutionName');
                        form.resetField('certificateType');
                      }}
                      value={field.value}
                      defaultValue={field.value || ''}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de documento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RG">RG</SelectItem>
                        <SelectItem value="CPF">CPF</SelectItem>
                        <SelectItem value="CNH">CNH</SelectItem>
                        <SelectItem value="CERTIFICATE">Certificado</SelectItem>
                        <SelectItem value="CRIMINAL_RECORD">
                          Antecedentes Criminais
                        </SelectItem>
                        <SelectItem value="PROOF_OF_ADDRESS">
                          Comprovante de Endereco
                        </SelectItem>
                        <SelectItem value="REFERENCE_LETTER">
                          Carta de Referencia
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {documentData && documentData.fileUrl && !wantEditFile ? (
                <div className="flex items-end gap-4">
                  <FormItem className="flex-1">
                    <FormLabel isOptional>Arquivo</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        value={
                          documentData.fileUrl.includes(',')
                            ? `${documentData.fileUrl.split(',').length} documentos`
                            : documentData.fileUrl.split('/').pop()
                        }
                        readOnly
                      />
                    </FormControl>
                  </FormItem>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setWantEditFile(true)}
                  >
                    <PencilSimpleIcon />
                    Alterar arquivo
                  </Button>
                </div>
              ) : form.watch('documentType') === 'RG' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormItem>
                      <FormLabel isOptional>Frente do RG</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const file = e.target.files[0];
                              if (!validateImageOrPdfType(file)) {
                                toast({
                                  variant: 'destructive',
                                  title: 'Erro ao enviar arquivo',
                                  description:
                                    'Por favor, envie um arquivo valido (JPEG, PNG, ou PDF).',
                                });
                                return;
                              }
                              const backUrl = documentFileUrl.split(',')[1] || '';
                              const frontUrl = URL.createObjectURL(file);
                              setDocumentFileUrl(
                                backUrl ? `${frontUrl},${backUrl}` : frontUrl,
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <FormItem>
                      <FormLabel isOptional>Verso do RG</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const file = e.target.files[0];
                              if (!validateImageOrPdfType(file)) {
                                toast({
                                  variant: 'destructive',
                                  title: 'Erro ao enviar arquivo',
                                  description:
                                    'Por favor, envie um arquivo valido (JPEG, PNG, ou PDF).',
                                });
                                return;
                              }
                              const frontUrl = documentFileUrl.split(',')[0] || '';
                              const backUrl = URL.createObjectURL(file);
                              setDocumentFileUrl(
                                frontUrl ? `${frontUrl},${backUrl}` : backUrl,
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                  {wantEditFile && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setWantEditFile(false)}
                    >
                      <XIcon />
                      Cancelar
                    </Button>
                  )}
                </div>
              ) : form.watch('documentType') === 'CNH' ? (
                <div className="flex items-end gap-4">
                  <FormField
                    name="fileUrl"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel isOptional>Foto da CNH</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*,application/pdf"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                const file = e.target.files[0];
                                if (!validateImageOrPdfType(file)) {
                                  toast({
                                    variant: 'destructive',
                                    title: 'Erro ao enviar arquivo',
                                    description:
                                      'Por favor, envie um arquivo valido (JPEG, PNG, ou PDF).',
                                  });
                                  return;
                                }
                                setDocumentFileUrl(URL.createObjectURL(file));
                              }
                              field.onChange(e);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {wantEditFile && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setWantEditFile(false)}
                    >
                      <XIcon />
                      Cancelar
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-end gap-4">
                  <FormField
                    name="fileUrl"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel isOptional>Arquivo(s)</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*,application/pdf"
                            multiple
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              handleFileChange(e);
                              field.onChange(e);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {wantEditFile && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setWantEditFile(false)}
                    >
                      <XIcon />
                      Cancelar
                    </Button>
                  )}
                </div>
              )}

              {form.watch('documentType') === 'RG' && (
                <div className="grid grid-cols-4 gap-4">
                  <FieldIdentifier
                    form={form}
                    placeholder="12.123.456-7"
                    required
                  />
                  <FieldIssuedBy form={form} />
                  <FieldStateIssued form={form} />
                  <FieldIssueDate form={form} />
                </div>
              )}

              {form.watch('documentType') === 'CNH' && (
                <div className="grid grid-cols-3 gap-4">
                  <FieldIdentifier
                    form={form}
                    placeholder="12345678900"
                    mask="###########"
                    required
                  />
                  <FieldIssueDate form={form} />
                  <FieldExpirationDate form={form} required />
                </div>
              )}

              {form.watch('documentType') === 'CPF' && (
                <div className="grid grid-cols-2 gap-4">
                  <FieldIdentifier
                    form={form}
                    placeholder="123.456.789-00"
                    mask="###.###.###-##"
                    required
                  />
                  <FieldIssueDate form={form} />
                </div>
              )}

              {form.watch('documentType') === 'CRIMINAL_RECORD' && (
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    name="validationStatus"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status de validação</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="NADA CONSTA"
                            {...field}
                            value={field.value || ''}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FieldIdentifier
                    form={form}
                    placeholder="123456789"
                    required
                  />
                  <FieldIssueDate form={form} />
                </div>
              )}

              {form.watch('documentType') === 'CERTIFICATE' && (
                <>
                  <FieldIdentifier
                    form={form}
                    placeholder="Tecnico em Enfermagem"
                    label="Título do Certificado"
                    required
                  />
                  <FormField
                    control={form.control}
                    name="institutionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Instituição</FormLabel>
                        <Input
                          type="text"
                          placeholder="Anhanguera Educacional"
                          {...field}
                          value={field.value || ''}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      name="certificateType"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grau</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value || ''}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o grau" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GRADUATION">
                                  Graduação
                                </SelectItem>
                                <SelectItem value="TECHNICAL">
                                  Técnico
                                </SelectItem>
                                <SelectItem value="SPECIALIZATION">
                                  Especialização
                                </SelectItem>
                                <SelectItem value="OTHER">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FieldIssueDate form={form} />
                    <FieldExpirationDate form={form} />
                  </div>
                </>
              )}

              {form.watch('documentType') === 'PROOF_OF_ADDRESS' && (
                <div className="grid grid-cols-2 gap-4">
                  <FieldIdentifier
                    form={form}
                    placeholder="Conta de luz, água, etc."
                    label="Descrição"
                  />
                  <FieldIssueDate form={form} />
                </div>
              )}

              {form.watch('documentType') === 'REFERENCE_LETTER' && (
                <div className="grid grid-cols-2 gap-4">
                  <FieldIdentifier
                    form={form}
                    placeholder="Nome do referenciador"
                    label="Referência"
                  />
                  <FieldIssueDate form={form} />
                </div>
              )}
            </div>
            <DialogFooter className="shrink-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Editando...' : 'Editar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
