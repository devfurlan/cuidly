import { jsPDF } from 'jspdf';
import prisma from '@/lib/prisma';
import { createAdminClient } from '@/utils/supabase/server';
import { decrypt, isEncrypted } from '@/lib/encryption';

// Type is inferred from Prisma query result

function formatCPF(cpf: string): string {
  // Descriptografar se necessário
  let cleanCpf = cpf;
  if (isEncrypted(cpf)) {
    cleanCpf = decrypt(cpf);
  }
  // Remover caracteres não numéricos
  cleanCpf = cleanCpf.replace(/\D/g, '');
  return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('pt-BR');
}

export async function generateValidationReport(requestId: string): Promise<Buffer> {
  const validation = await prisma.validationRequest.findUnique({
    where: { id: requestId },
    include: {
      nanny: {
        select: {
          name: true,
          phoneNumber: true,
          emailAddress: true,
        },
      },
    },
  });

  if (!validation) {
    throw new Error('Validation request not found');
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header
  doc.setFillColor(147, 51, 234); // Purple
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CUIDLY', 20, 25);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório de Validação Premium', 20, 35);

  yPosition = 55;

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Certificado de Validação de Identidade', pageWidth / 2, yPosition, {
    align: 'center',
  });
  yPosition += 15;

  // Validation Status Badge
  const statusColor = validation.status === 'COMPLETED' ? [34, 197, 94] : [239, 68, 68];
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth / 2 - 30, yPosition - 5, 60, 12, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(
    validation.status === 'COMPLETED' ? 'APROVADO' : 'REPROVADO',
    pageWidth / 2,
    yPosition + 3,
    { align: 'center' }
  );
  yPosition += 20;

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Section: Dados Pessoais
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados Pessoais', 20, yPosition);
  yPosition += 8;

  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const personalData = [
    ['Nome Completo:', validation.name],
    ['CPF:', formatCPF(validation.cpf)],
    ['RG:', validation.rg || 'N/A'],
    ['UF Emissão:', validation.rgIssuingState || 'N/A'],
    ['Data de Nascimento:', formatDate(validation.birthDate)],
    ['Nome da Mãe:', validation.motherName || 'N/A'],
    ['Nome do Pai:', validation.fatherName || 'N/A'],
  ];

  for (const [label, value] of personalData) {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 70, yPosition);
    yPosition += 7;
  }

  yPosition += 10;

  // Section: Validação BigID
  if (validation.level === 'PREMIUM') {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Validação de Documentos (BigID)', 20, yPosition);
    yPosition += 8;

    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const bigidData = [
      ['Status:', validation.bigidValid ? 'Aprovado' : 'Reprovado'],
      ['Facematch Score:', `${validation.facematchScore || 0}%`],
      ['Liveness Score:', `${validation.livenessScore || 0}%`],
    ];

    for (const [label, value] of bigidData) {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPosition);
      doc.setFont('helvetica', 'normal');

      // Color code the scores
      if (label.includes('Score')) {
        const score = parseInt(value);
        if (score >= 80) {
          doc.setTextColor(34, 197, 94); // Green
        } else if (score >= 60) {
          doc.setTextColor(234, 179, 8); // Yellow
        } else {
          doc.setTextColor(239, 68, 68); // Red
        }
      }
      doc.text(value, 70, yPosition);
      doc.setTextColor(0, 0, 0); // Reset
      yPosition += 7;
    }

    yPosition += 10;

    // Section: Antecedentes Criminais
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Antecedentes Criminais', 20, yPosition);
    yPosition += 8;

    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);

    // Federal
    doc.setFont('helvetica', 'bold');
    doc.text('Polícia Federal:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    const federalStatus = validation.federalRecordResult ? 'Consultado' : 'Não consultado';
    doc.text(federalStatus, 70, yPosition);
    yPosition += 7;

    // Civil/Estadual
    doc.setFont('helvetica', 'bold');
    doc.text('Polícia Civil:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    const civilStatus = validation.civilRecordResult ? 'Consultado' : 'Não consultado';
    doc.text(civilStatus, 70, yPosition);
    yPosition += 15;
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Relatório gerado em ${new Date().toLocaleString('pt-BR')}`,
    pageWidth / 2,
    280,
    { align: 'center' }
  );
  doc.text(`ID da Validação: ${validation.id}`, pageWidth / 2, 285, { align: 'center' });
  doc.text('Este documento foi gerado automaticamente pela plataforma Cuidly.', pageWidth / 2, 290, {
    align: 'center',
  });

  // Return as Buffer
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
}

export async function uploadReportToStorage(
  buffer: Buffer,
  nannyId: number,
  requestId: string
): Promise<string> {
  const adminSupabase = createAdminClient();

  const fileName = `${nannyId}/report_${requestId}_${Date.now()}.pdf`;

  const { data, error } = await adminSupabase.storage
    .from('documents')
    .upload(fileName, buffer, {
      contentType: 'application/pdf',
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload report: ${error.message}`);
  }

  return data.path;
}
