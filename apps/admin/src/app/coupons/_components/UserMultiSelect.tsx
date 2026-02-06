'use client';

import { useState, useCallback, useEffect } from 'react';
import { PiX, PiUser, PiUsers, PiSpinner, PiCheck } from 'react-icons/pi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/shadcn/utils';
import type { CouponUser } from '@/app/api/coupons/users/route';

interface SelectedUser {
  id: number;
  name: string;
  email: string;
  type: 'NANNY' | 'FAMILY';
}

interface UserMultiSelectProps {
  selectedNannies: number[];
  selectedFamilies: number[];
  onNanniesChange: (ids: number[]) => void;
  onFamiliesChange: (ids: number[]) => void;
  initialUsers?: SelectedUser[];
}

export function UserMultiSelect({
  selectedNannies,
  selectedFamilies,
  onNanniesChange,
  onFamiliesChange,
  initialUsers = [],
}: UserMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<CouponUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>(initialUsers);

  // Buscar usuários quando a busca mudar
  const fetchUsers = useCallback(async (searchTerm: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      params.set('limit', '50');

      const response = await fetch(`/api/coupons/users?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) {
        fetchUsers(search);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, open, fetchUsers]);

  // Carregar usuários ao abrir
  useEffect(() => {
    if (open && users.length === 0) {
      fetchUsers('');
    }
  }, [open, users.length, fetchUsers]);

  // Verificar se usuário está selecionado
  const isSelected = (user: CouponUser) => {
    if (user.type === 'NANNY') {
      return selectedNannies.includes(user.id);
    }
    return selectedFamilies.includes(user.id);
  };

  // Selecionar/deselecionar usuário
  const toggleUser = (user: CouponUser) => {
    const selected: SelectedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
    };

    if (user.type === 'NANNY') {
      if (selectedNannies.includes(user.id)) {
        onNanniesChange(selectedNannies.filter((id) => id !== user.id));
        setSelectedUsers((prev) =>
          prev.filter((u) => !(u.type === 'NANNY' && u.id === user.id)),
        );
      } else {
        onNanniesChange([...selectedNannies, user.id]);
        setSelectedUsers((prev) => [...prev, selected]);
      }
    } else {
      if (selectedFamilies.includes(user.id)) {
        onFamiliesChange(selectedFamilies.filter((id) => id !== user.id));
        setSelectedUsers((prev) =>
          prev.filter((u) => !(u.type === 'FAMILY' && u.id === user.id)),
        );
      } else {
        onFamiliesChange([...selectedFamilies, user.id]);
        setSelectedUsers((prev) => [...prev, selected]);
      }
    }
  };

  // Remover usuário pelo badge
  const removeUser = (user: SelectedUser) => {
    if (user.type === 'NANNY') {
      onNanniesChange(selectedNannies.filter((id) => id !== user.id));
    } else {
      onFamiliesChange(selectedFamilies.filter((id) => id !== user.id));
    }
    setSelectedUsers((prev) =>
      prev.filter((u) => !(u.type === user.type && u.id === user.id)),
    );
  };

  const totalSelected = selectedNannies.length + selectedFamilies.length;

  // Separar usuários por tipo para exibição
  const nannies = users.filter((u) => u.type === 'NANNY');
  const families = users.filter((u) => u.type === 'FAMILY');

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <PiUsers className="size-4" />
              {totalSelected > 0
                ? `${totalSelected} usuário${totalSelected > 1 ? 's' : ''} selecionado${totalSelected > 1 ? 's' : ''}`
                : 'Selecionar usuários...'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Pesquisar por nome ou e-mail..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <PiSpinner className="size-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {!loading && users.length === 0 && (
                <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
              )}
              {!loading && nannies.length > 0 && (
                <CommandGroup heading="Babás">
                  {nannies.map((user) => (
                    <CommandItem
                      key={`nanny-${user.id}`}
                      value={`nanny-${user.id}`}
                      onSelect={() => toggleUser(user)}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          'mr-2 flex size-4 items-center justify-center rounded-sm border',
                          isSelected(user)
                            ? 'border-fuchsia-500 bg-fuchsia-500 text-white'
                            : 'border-gray-300',
                        )}
                      >
                        {isSelected(user) && <PiCheck className="size-3" />}
                      </div>
                      <div className="flex flex-1 items-center gap-2">
                        <PiUser className="size-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </div>
                      <Badge variant="purple" size="sm">
                        Babá
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {!loading && families.length > 0 && (
                <CommandGroup heading="Famílias">
                  {families.map((user) => (
                    <CommandItem
                      key={`family-${user.id}`}
                      value={`family-${user.id}`}
                      onSelect={() => toggleUser(user)}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          'mr-2 flex size-4 items-center justify-center rounded-sm border',
                          isSelected(user)
                            ? 'border-fuchsia-500 bg-fuchsia-500 text-white'
                            : 'border-gray-300',
                        )}
                      >
                        {isSelected(user) && <PiCheck className="size-3" />}
                      </div>
                      <div className="flex flex-1 items-center gap-2">
                        <PiUsers className="size-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </div>
                      <Badge variant="blue" size="sm">
                        Família
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Badges dos usuários selecionados */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <Badge
              key={`${user.type}-${user.id}`}
              variant={user.type === 'NANNY' ? 'purple' : 'blue'}
              className="flex items-center gap-1 pr-1"
            >
              <span>{user.name}</span>
              <button
                type="button"
                onClick={() => removeUser(user)}
                className="ml-1 rounded-full p-0.5 hover:bg-black/10"
              >
                <PiX className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
