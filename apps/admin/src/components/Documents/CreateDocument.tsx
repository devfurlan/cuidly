import { useParams } from 'next/navigation';
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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { ChangeEvent, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { validateImageOrPdfType } from '@/utils/validateFileType';
import { convertBlobUrlToFile } from '@/utils/convertBlobUrlToFile';
import { uploadPrivateFile } from '@/lib/supabase/storage/client';
import { createDocument } from '@/services/documentService';
import FieldIdentifier from './ui/FieldIdentifier';
import FieldIssuedBy from './ui/FieldIssuedBy';
import FieldStateIssued from './ui/FieldStateIssued';
import FieldIssueDate from './ui/FieldIssueDate';
import FieldExpirationDate from './ui/FieldExpirationDate';
import { DialogClose } from '@radix-ui/react-dialog';

export default function CreateDocument({
  children,
  onDocumentCreated,
}: {
  children: React.ReactNode;
  onDocumentCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [documentFileUrl, setDocumentFileUrl] = useState<string>('');
  const { slug } = useParams();
  const { toast } = useToast();

  const form = useForm<NannyDocument>({
    resolver: zodResolver(NannyDocumentSchema),
    defaultValues: {
      documentType: 'RG',
      identifier: '',
      fileUrl: '',
      issuedBy: '',
      stateIssued: '',
      issueDate: '',
      expirationDate: '',
      validationStatus: '',
      institutionName: '',
    },
  });

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      for (const file of files) {
        if (!validateImageOrPdfType(file)) {
          toast({
            variant: 'destructive',
            title: 'Erro ao enviar arquivo',
            description:
              'Por favor, envie um arquivo válido (JPEG, PNG, ou PDF).',
          });
          return;
        }
      }

      const imageUrls = files.map((file) => URL.createObjectURL(file));
      setDocumentFileUrl(imageUrls.join(','));
    }
  }

  async function onSubmitDocument(data: NannyDocument) {
    let uploadedUrl = '';
    if (documentFileUrl) {
      const fileUrls = documentFileUrl.split(',');
      const uploadedUrls = [];

      for (const url of fileUrls) {
        const { file } = await convertBlobUrlToFile(url);
        const { fileUrl, error } = await uploadPrivateFile({
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
        uploadedUrls.push(fileUrl);
      }
      uploadedUrl = uploadedUrls.join(',');
    }

    try {
      await createDocument(data, uploadedUrl, slug as string);
      toast({ variant: 'success', title: 'Documento adicionado com sucesso!' });
      onDocumentCreated();
      form.reset();
      setDocumentFileUrl('');
      setOpen(false);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar documento',
        description: 'Tente novamente.',
      });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setDocumentFileUrl('');
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="sm:min-h-[620px] sm:max-w-[820px]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitDocument)}
            className="h-full sm:flex sm:flex-col"
          >
            <DialogHeader className="shrink-0">
              <DialogTitle>Adicionar Documento</DialogTitle>
              <DialogDescription>
                Adicione um novo documento para a baba.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-1 flex-col gap-4 pb-8 pt-6">
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
                      defaultValue={field.value}
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

              {form.watch('documentType') === 'RG' ? (
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
                                  'Por favor, envie um arquivo válido (JPEG, PNG, ou PDF).',
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
                                  'Por favor, envie um arquivo válido (JPEG, PNG, ou PDF).',
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
              ) : form.watch('documentType') === 'CNH' ? (
                <FormField
                  name="fileUrl"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
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
                                    'Por favor, envie um arquivo válido (JPEG, PNG, ou PDF).',
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
              ) : (
                <FormField
                  name="fileUrl"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
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
                              defaultValue={field.value}
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
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Adicionando...' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
