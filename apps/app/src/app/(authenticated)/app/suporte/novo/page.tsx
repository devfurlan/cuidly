'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/shadcn/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { PiArrowLeft } from 'react-icons/pi';
import Link from 'next/link';
import { toast } from 'sonner';

const CATEGORY_OPTIONS = [
  { value: 'SUBSCRIPTION_PAYMENT', label: 'Assinatura / Pagamento' },
  { value: 'ACCOUNT', label: 'Conta' },
  { value: 'BUG_TECHNICAL', label: 'Bug / Problema técnico' },
  { value: 'SUGGESTION', label: 'Sugestão' },
  { value: 'OTHER', label: 'Outro' },
];

export default function NovoTicketPage() {
  const router = useRouter();
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !subject.trim() || !body.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, subject: subject.trim(), body: body.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar chamado');
      }

      const ticket = await response.json();
      toast.success('Chamado criado com sucesso');
      router.push(`/app/suporte/chamados/${ticket.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao criar chamado',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/app/suporte"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <PiArrowLeft className="size-4" />
          Voltar ao Suporte
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Novo Chamado</h1>
        <p className="mt-1 text-gray-500">
          Descreva o problema ou dúvida que deseja reportar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Abrir chamado</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Resumo breve do problema ou dúvida"
                maxLength={200}
              />
              <p className="text-xs text-gray-400">
                {subject.length}/200 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Descrição</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Descreva com detalhes o que está acontecendo..."
                rows={6}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar chamado'}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/app/suporte">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
