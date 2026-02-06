import { z } from 'zod';

export const NannyDocumentSchema = z.object({
  documentType: z.enum([
    'RG',
    'CPF',
    'CNH',
    'CERTIFICATE',
    'CRIMINAL_RECORD',
    'PROOF_OF_ADDRESS',
    'REFERENCE_LETTER',
  ]),
  identifier: z.string(),
  institutionName: z.string().optional(),
  certificateType: z
    .enum(['GRADUATION', 'TECHNICAL', 'SPECIALIZATION', 'OTHER'])
    .optional()
    .or(z.literal('')),
  fileUrl: z.string().optional(),
  issuedBy: z.string().optional(),
  stateIssued: z.string().optional(),
  issueDate: z.string().optional(),
  expirationDate: z.string().optional(),
  validationStatus: z.string().optional(),
});

export type NannyDocument = z.infer<typeof NannyDocumentSchema>;
