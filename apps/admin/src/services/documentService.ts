'use server';

import prisma from '@/lib/prisma';
import { NannyDocument } from '@/components/Documents/schemas';
import { removeDots } from '@/utils/removeDots';
import { removeNonNumericCharacters } from '@/utils/removeNonNumericCharacters';
import { Document } from '@prisma/client';
import { logAudit } from '@/utils/auditLog';

async function getNannyIdBySlug(slug: string) {
  return await prisma.nanny.findUnique({
    where: { slug },
    select: { id: true },
  });
}

export async function getDocumentsByNanny(nannyId: number) {
  return await prisma.document.findMany({
    where: {
      nannyId: nannyId,
      status: {
        not: 'DELETED',
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getDocumentById(id: number): Promise<Document> {
  return await prisma.document.findUniqueOrThrow({
    where: { id },
  });
}

export async function createDocument(
  data: NannyDocument,
  imageUrl: string,
  slug: string,
) {
  try {
    const nanny = await getNannyIdBySlug(slug);
    if (!nanny) {
      throw new Error('Nanny not found');
    }

    const documentData = {
      documentType: data.documentType,
      fileUrl: imageUrl,
      identifier:
        data.documentType === 'CPF'
          ? removeNonNumericCharacters(data.identifier)
          : removeDots(data.identifier),
      institutionName: data.institutionName,
      certificateType: data.certificateType || null,
      issuedBy: data.issuedBy,
      stateIssued: data.stateIssued,
      issueDate: data.issueDate
        ? new Date(data.issueDate.split('/').reverse().join('-')).toISOString()
        : null,
      expirationDate: data.expirationDate
        ? new Date(
            data.expirationDate.split('/').reverse().join('-'),
          ).toISOString()
        : null,
      validationStatus: data.validationStatus,
    };

    const document = await prisma.document.create({
      data: { ...documentData, nannyId: nanny.id },
    });

    await logAudit({
      action: 'CREATE',
      table: 'documents',
      recordId: document.id,
      data: documentData,
    });

    return document;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error creating document: ${error.message}`);
    } else {
      throw new Error('Error creating document');
    }
  }
}

export async function updateDocument(
  id: number,
  data: NannyDocument,
  imageUrl?: string,
) {
  try {
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    const updatedData = {
      documentType: data.documentType,
      fileUrl: imageUrl || document.fileUrl,
      identifier:
        data.documentType === 'CPF'
          ? removeNonNumericCharacters(data.identifier)
          : removeDots(data.identifier),
      institutionName: data.institutionName,
      certificateType: data.certificateType || null,
      issuedBy: data.issuedBy,
      stateIssued: data.stateIssued,
      issueDate: data.issueDate
        ? new Date(data.issueDate.split('/').reverse().join('-')).toISOString()
        : null,
      expirationDate: data.expirationDate
        ? new Date(
            data.expirationDate.split('/').reverse().join('-'),
          ).toISOString()
        : null,
      validationStatus: data.validationStatus,
    };

    const updated = await prisma.document.update({
      where: { id },
      data: updatedData,
    });

    await logAudit({
      action: 'UPDATE',
      table: 'documents',
      recordId: id,
      data: updatedData,
    });

    return updated;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error updating document: ${error.message}`);
    } else {
      throw new Error('Error updating document');
    }
  }
}

export async function deleteDocument(id: number) {
  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  await prisma.document.update({
    where: { id },
    data: { status: 'DELETED', deletedAt: new Date() },
  });

  await logAudit({
    action: 'DELETE',
    table: 'documents',
    recordId: id,
    data: { status: 'DELETED' },
  });
}
