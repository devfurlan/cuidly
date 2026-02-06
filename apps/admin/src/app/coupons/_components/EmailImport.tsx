'use client';

import * as React from 'react';
import { useState, useCallback } from 'react';
import { PiX, PiUploadSimple, PiEnvelope, PiWarning } from 'react-icons/pi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface EmailImportProps {
  emails: string[];
  onChange: (emails: string[]) => void;
}

// Regex simples para validar e-mail
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailImport({ emails, onChange }: EmailImportProps) {
  const [inputValue, setInputValue] = useState('');
  const [invalidEmails, setInvalidEmails] = useState<string[]>([]);

  // Processar texto e extrair e-mails
  const processEmails = useCallback(
    (text: string) => {
      // Separar por vírgula, ponto-e-vírgula, nova linha ou espaço
      const rawEmails = text
        .split(/[,;\n\s]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 0);

      const valid: string[] = [];
      const invalid: string[] = [];

      rawEmails.forEach((email) => {
        if (EMAIL_REGEX.test(email)) {
          if (!emails.includes(email) && !valid.includes(email)) {
            valid.push(email);
          }
        } else {
          invalid.push(email);
        }
      });

      if (valid.length > 0) {
        onChange([...emails, ...valid]);
      }

      setInvalidEmails(invalid);
      setInputValue('');
    },
    [emails, onChange],
  );

  // Adicionar e-mails do textarea
  const handleAddEmails = () => {
    if (inputValue.trim()) {
      processEmails(inputValue);
    }
  };

  // Upload de arquivo CSV
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      processEmails(text);
    };
    reader.readAsText(file);

    // Limpar o input para permitir reupload do mesmo arquivo
    event.target.value = '';
  };

  // Remover e-mail
  const removeEmail = (email: string) => {
    onChange(emails.filter((e) => e !== email));
  };

  // Limpar todos
  const clearAll = () => {
    onChange([]);
    setInvalidEmails([]);
  };

  return (
    <div className="space-y-4">
      {/* Textarea para colar e-mails */}
      <div className="space-y-2">
        <Label htmlFor="emails-textarea">E-mails</Label>
        <Textarea
          id="emails-textarea"
          placeholder="Cole ou digite os e-mails, separados por vírgula, ponto-e-vírgula ou nova linha..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          rows={4}
          className="resize-none"
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddEmails}
            disabled={!inputValue.trim()}
          >
            <PiEnvelope className="mr-2 size-4" />
            Adicionar e-mails
          </Button>

          {/* Upload CSV */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
          >
            <label className="cursor-pointer">
              <PiUploadSimple className="mr-2 size-4" />
              Importar CSV
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </div>

      {/* E-mails inválidos */}
      {invalidEmails.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center gap-2 text-amber-700">
            <PiWarning className="size-4" />
            <span className="text-sm font-medium">E-mails inválidos:</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {invalidEmails.map((email, index) => (
              <Badge key={index} variant="orange" size="sm">
                {email}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* E-mails adicionados */}
      {emails.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {emails.length} e-mail{emails.length > 1 ? 's' : ''} adicionado
              {emails.length > 1 ? 's' : ''}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-destructive"
            >
              Limpar todos
            </Button>
          </div>
          <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-md border bg-gray-50 p-3">
            {emails.map((email) => (
              <Badge
                key={email}
                variant="default"
                className="flex items-center gap-1 pr-1"
              >
                <span>{email}</span>
                <button
                  type="button"
                  onClick={() => removeEmail(email)}
                  className="ml-1 rounded-full p-0.5 hover:bg-black/10"
                >
                  <PiX className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
