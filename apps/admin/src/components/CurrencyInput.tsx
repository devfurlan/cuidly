'use client';

import { useState } from 'react';

type CurrencyInputProps = {
  value: number | null;
  onChange: (value: number) => void;
  placeholder?: string;
  id?: string;
  name?: string;
};

export function CurrencyInput({
  value,
  onChange,
  placeholder = '0,00',
  id,
  name,
}: CurrencyInputProps) {
  const [localValue, setLocalValue] = useState(formatCurrencyBRL(value ?? 0));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '');
    const numeric = Number(onlyNumbers) / 100;

    setLocalValue(formatCurrencyBRL(numeric));
    onChange(numeric);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('Text');
    const onlyNumbers = pastedText.replace(/\D/g, '');
    const numeric = Number(onlyNumbers) / 100;

    setLocalValue(formatCurrencyBRL(numeric));
    onChange(numeric);
  };

  return (
    <div className="flex h-10 w-full items-center rounded-md border border-input bg-background bg-white px-3 py-2 pl-3 text-base font-medium text-black focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background md:text-sm">
      <div className="shrink-0 select-none text-base text-gray-500 sm:text-sm">
        R$
      </div>
      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-black placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
        value={localValue}
        onChange={handleChange}
        onPaste={handlePaste}
      />
    </div>
  );
}

function formatCurrencyBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
