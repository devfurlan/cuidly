'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';

export default function ConversationSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    router.push(`/moderation/chat?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
      <Input
        placeholder="Buscar por nome ou e-mail do participante..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1"
      />
      <Button type="submit">
        <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
        Buscar
      </Button>
    </form>
  );
}
