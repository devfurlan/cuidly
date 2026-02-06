'use client';

import { useRef } from 'react';
import { toPng } from 'html-to-image';
import { calculateAge } from '@/utils/calculateAge';
import { formatCpf } from '@/utils/formatCpf';
import {
  CakeIcon,
  CalendarIcon,
  IdentificationCardIcon,
  MapPinIcon,
} from '@phosphor-icons/react';
import { formatDate } from 'date-fns';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../components/ui/avatar';
import { publicFilesUrl } from '@/constants/publicFilesUrl';
import getInitials from '@/utils/getInitials';
import BadgeStatus from '../../../components/BadgeStatus';
import { Button } from '../../../components/ui/button';
import { useToast } from '@/hooks/useToast';
import { Address, Nanny } from '@prisma/client';

interface NannyWithInfos extends Nanny {
  address?: Address | null;
}

export default function NannyIdentificationCard({
  nanny,
}: {
  nanny: NannyWithInfos;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!divRef.current) return;

    try {
      const originalStyle = {
        margin: divRef.current.style.margin,
        padding: divRef.current.style.padding,
        background: divRef.current.style.background,
        boxSizing: divRef.current.style.boxSizing,
        width: divRef.current.style.width,
        overflow: divRef.current.style.overflow,
      };

      divRef.current.style.margin = '0';
      divRef.current.style.padding = '0';
      divRef.current.style.background = 'white';
      divRef.current.style.boxSizing = 'border-box';
      divRef.current.style.width = '560px';
      divRef.current.style.overflow = 'hidden';

      const dataUrl = await toPng(divRef.current, {
        pixelRatio: 2,
        width: 560,
        height: divRef.current.offsetHeight,
      });

      Object.assign(divRef.current.style, originalStyle);

      const res = await fetch(dataUrl);
      const blob = await res.blob();

      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);

      toast({
        variant: 'success',
        title: 'Copiado com sucesso!',
        description:
          'O perfil foi copiado para a area de transferencia com sucesso.',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error copying:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao copiar!',
        description:
          'Ocorreu um erro ao copiar o perfil para a area de transferencia.',
      });
    }
  };

  return (
    <div className="relative">
      <BadgeStatus status={nanny.status} className="absolute start-4 top-4" />

      <Button
        variant={'link'}
        onClick={handleCopy}
        className="absolute end-4 top-2 text-sm"
      >
        Copiar
      </Button>
      <div ref={divRef}>
        <div className="shadow-base rounded-lg border bg-card text-card-foreground">
          <div className="p-6 pt-6 lg:pt-12">
            <div className="space-y-12">
              <div className="flex flex-col items-center space-y-4">
                <span className="relative flex size-28 shrink-0 overflow-hidden rounded-full">
                  <Avatar className="aspect-square h-full w-full">
                    <AvatarImage
                      src={publicFilesUrl(nanny.photoUrl as string)}
                      alt={`Foto: ${nanny.name}`}
                    />
                    <AvatarFallback className="rounded-lg bg-fuchsia-200 text-fuchsia-600">
                      {getInitials(nanny.name)}
                    </AvatarFallback>
                  </Avatar>
                </span>
                <div className="text-center">
                  <h5 className="text-xl font-semibold">{nanny.name}</h5>
                  <div className="text-sm text-muted-foreground">
                    Baba
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-y-4">
                {nanny.birthDate && (
                  <div className="flex items-center gap-3 text-sm">
                    <CakeIcon className="size-4 text-base text-fuchsia-600" />
                    <div className="flex items-center gap-1.5">
                      {calculateAge(new Date(nanny.birthDate))} anos{' '}
                      <small className="text-muted-foreground">
                        {formatDate(new Date(nanny.birthDate), 'dd/MM/yyyy')}
                      </small>
                    </div>
                  </div>
                )}
                {nanny.cpf && (
                  <div className="flex items-center gap-3 text-sm">
                    <IdentificationCardIcon className="size-4 text-base text-fuchsia-600" />
                    <div className="flex items-center gap-1.5">
                      <small className="text-muted-foreground">CPF</small>
                      {formatCpf(nanny.cpf as string)}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <CalendarIcon className="size-4 text-base text-fuchsia-600" />
                  Cadastrada em{' '}
                  {formatDate(new Date(nanny.createdAt), 'dd/MM/yyyy')}
                </div>
                {nanny.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPinIcon className="size-4 text-base text-fuchsia-600" />
                    {nanny.address.neighborhood}, {nanny.address.city}/
                    {nanny.address.state}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
