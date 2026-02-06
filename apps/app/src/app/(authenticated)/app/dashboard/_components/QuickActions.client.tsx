'use client';

/**
 * Quick Actions Client Component
 * Navigation buttons for dashboard
 */

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/shadcn/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';
import { PiMagnifyingGlass, PiPlus, PiUser, PiUsers } from 'react-icons/pi';

interface QuickActionsProps {
  userType: 'nanny' | 'family';
}

export function QuickActions({ userType }: QuickActionsProps) {
  const router = useRouter();

  if (userType === 'nanny') {
    return (
      <Button
        className="bg-fuchsia-600 hover:bg-fuchsia-700"
        onClick={() => router.push('/app/vagas')}
      >
        <PiMagnifyingGlass className="mr-2 size-4" />
        Explorar Vagas
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Button
            variant="outline"
            className="h-auto justify-start gap-3 p-4"
            onClick={() => router.push('/app/explorar')}
          >
            <div className="rounded-lg bg-fuchsia-100 p-2">
              <PiUser className="size-5 text-fuchsia-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">Explorar Babás</p>
              <p className="text-xs text-gray-500">
                Encontre babás na sua região
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto justify-start gap-3 p-4"
            onClick={() => router.push('/app/vagas/criar')}
          >
            <div className="rounded-lg bg-blue-100 p-2">
              <PiPlus className="size-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">Criar Vaga</p>
              <p className="text-xs text-gray-500">
                Publique uma nova oportunidade
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto justify-start gap-3 p-4"
            onClick={() => router.push('/app/perfil')}
          >
            <div className="rounded-lg bg-purple-100 p-2">
              <PiUsers className="size-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">Minha Família</p>
              <p className="text-xs text-gray-500">
                Gerencie informações da família
              </p>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface CreateJobButtonProps {
  className?: string;
}

export function CreateJobButton({ className }: CreateJobButtonProps) {
  const router = useRouter();

  return (
    <Button
      className={className || 'bg-blue-600 hover:bg-blue-700'}
      onClick={() => router.push('/app/vagas/criar')}
    >
      <PiPlus className="mr-2 size-4" />
      Criar Nova Vaga
    </Button>
  );
}

export function ExploreJobsButton() {
  const router = useRouter();

  return (
    <Button
      className="mt-4 bg-fuchsia-600 hover:bg-fuchsia-700"
      onClick={() => router.push('/app/vagas')}
    >
      <PiMagnifyingGlass className="mr-2 size-4" />
      Explorar Vagas
    </Button>
  );
}
