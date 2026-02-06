/**
 * Family Applications Section
 * Displays pending applications from nannies (server component with async data fetching)
 */

import { getFamilyRecentApplications } from '@/lib/data/dashboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/shadcn/avatar';
import { PiClock, PiMapPin, PiStarFill, PiUsers } from 'react-icons/pi';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FamilyApplicationsSectionProps {
  familyId: number;
}

function getUserInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export async function FamilyApplicationsSection({
  familyId,
}: FamilyApplicationsSectionProps) {
  const applications = await getFamilyRecentApplications(familyId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Candidaturas Pendentes</CardTitle>
            <CardDescription>Babás interessadas em suas vagas</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <Link
                key={app.id}
                href={`/app/vagas/${app.jobId}?candidatura=${app.id}`}
                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-gray-50"
              >
                <Avatar className="size-12">
                  {app.nanny.photoUrl && (
                    <AvatarImage
                      src={app.nanny.photoUrl}
                      alt={app.nanny.name}
                    />
                  )}
                  <AvatarFallback className="bg-fuchsia-100 text-fuchsia-600">
                    {getUserInitials(app.nanny.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {app.nanny.name}
                  </h4>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    {app.nanny.city && app.nanny.state && (
                      <span className="flex items-center gap-1">
                        <PiMapPin className="size-3" />
                        {app.nanny.city}, {app.nanny.state}
                      </span>
                    )}
                    {app.matchScore && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <PiStarFill className="size-3" />
                        {app.matchScore.toFixed(0)}% match
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Para: {app.jobTitle}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                    Pendente
                  </span>
                  <p className="mt-1 flex items-center justify-end gap-1 text-xs text-gray-400">
                    <PiClock className="size-3" />
                    {formatDistanceToNow(new Date(app.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <PiUsers className="mx-auto size-12 text-gray-300" />
            <p className="mt-2 text-gray-500">Nenhuma candidatura pendente</p>
            <p className="mt-1 text-sm text-gray-400">
              Novas candidaturas aparecerão aqui
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
