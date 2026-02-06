'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/utils/cn';
import getInitials from '@/utils/getInitials';
import { CaretDownIcon, CheckIcon, XIcon } from '@phosphor-icons/react';
import { useState } from 'react';

type ComboboxOption = {
  label: string;
  value: string;
  avatarUrl?: string | null;
  indicatorColor?: string | null;
};

type AdvancedComboboxProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  options: ComboboxOption[];
  placeholder?: string;
  emptyMessage?: string;
  allowClear?: boolean;
  side?: 'top' | 'bottom' | 'left' | 'right';
};

export default function Combobox({
  value,
  onChange,
  options,
  placeholder = 'Selecione a opção',
  emptyMessage = 'Nenhuma opção encontrada.',
  allowClear = false,
  side = 'bottom',
}: AdvancedComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setSearch('');
        }
      }}
    >
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <button
            type="button"
            className="flex w-full items-center justify-between truncate rounded-md border px-4 py-2 text-sm"
            aria-expanded={open}
          >
            {selected ? (
              <div
                className={cn(
                  'flex items-center gap-2',
                  allowClear ? 'w-[calc(100%-44px)]' : 'w-[calc(100%-24px)]',
                )}
              >
                {selected.avatarUrl && (
                  <Avatar className="size-5 rounded-full">
                    <AvatarImage
                      src={selected.avatarUrl}
                      alt={selected.label}
                    />
                    <AvatarFallback className="text-2xs rounded-full bg-fuchsia-200 text-fuchsia-600">
                      {getInitials(selected.label)}
                    </AvatarFallback>
                  </Avatar>
                )}

                {!selected.avatarUrl && selected.indicatorColor && (
                  <span
                    className={cn(
                      'inline-block size-2 shrink-0 rounded-full border border-transparent',
                      selected.indicatorColor,
                    )}
                    aria-hidden="true"
                  />
                )}

                <span className="truncate font-medium text-black">
                  {selected.label}
                </span>
              </div>
            ) : (
              <span className="font-medium text-gray-400">{placeholder}</span>
            )}
            <CaretDownIcon className="ml-2 size-4 text-gray-500" />
          </button>

          {allowClear && value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                setSearch('');
              }}
              className="absolute top-[11px] right-10 text-gray-400 hover:text-gray-600"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        side={side}
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <Command>
          <CommandInput
            placeholder="Pesquisar..."
            onValueChange={(value) => setSearch(value)}
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandList>
            {filteredOptions.map((opt) => (
              <CommandItem
                key={opt.value}
                value={opt.label}
                onSelect={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setSearch('');
                }}
                className={cn(value === opt.value && 'bg-gray-50')}
              >
                <div className="flex items-center gap-2">
                  {opt.avatarUrl && (
                    <Avatar className="size-5 rounded-full">
                      <AvatarImage src={opt.avatarUrl} alt={opt.label} />
                      <AvatarFallback className="text-2xs rounded-full bg-fuchsia-200 text-fuchsia-600">
                        {getInitials(opt.label)}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {!opt.avatarUrl && opt.indicatorColor && (
                    <span
                      className={cn(
                        'inline-block size-2 shrink-0 rounded-full border border-transparent',
                        opt.indicatorColor,
                      )}
                      aria-hidden="true"
                    />
                  )}

                  <span>{opt.label}</span>
                </div>
                {value === opt.value && (
                  <CheckIcon className="ml-auto size-4 text-green-600" />
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
