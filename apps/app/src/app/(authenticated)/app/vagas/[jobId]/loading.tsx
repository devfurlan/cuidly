/**
 * Loading skeleton for job details page
 * Route: /app/vagas/[jobId]
 */

import { Card } from '@/components/ui/shadcn/card';

export default function Loading() {
  return (
    <>
      {/* Header Skeleton */}
      <div className="mb-6">
        {/* Family header (for nannies) */}
        <div className="mb-6 flex items-center gap-4">
          <div className="size-16 animate-pulse rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        {/* Title and actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
            </div>
            <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-9 w-28 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Sobre a Familia */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="size-5 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            </div>
          </Card>

          {/* Fotos */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="size-5 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-lg bg-gray-200"
                />
              ))}
            </div>
          </Card>

          {/* Detalhes da Vaga */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="size-5 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </Card>

          {/* Turnos */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="size-5 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
            </div>
            {/* Grid skeleton */}
            <div className="space-y-1">
              {/* Header row */}
              <div className="mb-2 grid grid-cols-[40px_repeat(7,1fr)] gap-0.5 sm:grid-cols-[60px_repeat(7,1fr)] sm:gap-1">
                <div />
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    className="h-7 animate-pulse rounded-md bg-gray-200"
                  />
                ))}
              </div>
              {/* Shift rows */}
              {[1, 2, 3, 4].map((row) => (
                <div
                  key={row}
                  className="grid grid-cols-[40px_repeat(7,1fr)] gap-0.5 sm:grid-cols-[60px_repeat(7,1fr)] sm:gap-1"
                >
                  <div className="h-7 animate-pulse rounded-md bg-gray-200 sm:h-9" />
                  {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                    <div
                      key={col}
                      className="h-7 animate-pulse rounded-md bg-gray-200 sm:h-9"
                    />
                  ))}
                </div>
              ))}
            </div>
          </Card>

          {/* Criancas */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="size-5 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-28 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                      <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
                    </div>
                    <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="h-6 w-24 animate-pulse rounded-full bg-gray-200"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Sobre o Ambiente */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="size-5 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-36 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </Card>

          {/* Requisitos e Beneficios */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="size-5 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-44 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-2 h-4 w-36 animate-pulse rounded bg-gray-200" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-6 w-28 animate-pulse rounded-full bg-gray-200"
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 h-4 w-36 animate-pulse rounded bg-gray-200" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-6 w-28 animate-pulse rounded-full bg-gray-200"
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Candidaturas Stats */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="size-5 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg bg-gray-50 p-3 text-center">
                  <div className="mx-auto h-8 w-8 animate-pulse rounded bg-gray-200" />
                  <div className="mx-auto mt-1 h-4 w-16 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </Card>

          {/* Compatibilidade Card */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="size-5 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-36 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="mb-4 rounded-lg bg-gray-100 p-4 text-center">
              <div className="mx-auto h-10 w-16 animate-pulse rounded bg-gray-200" />
              <div className="mx-auto mt-2 h-4 w-32 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-4 w-8 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Candidatar-se Card */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="size-5 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="mb-4 h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
          </Card>
        </div>
      </div>

      {/* Babas Recomendadas */}
      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="size-5 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-44 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-28 animate-pulse rounded-full bg-gray-200" />
        </div>
        <div className="mb-4 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="size-12 animate-pulse rounded-full bg-gray-200" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="h-10 w-12 animate-pulse rounded-lg bg-gray-200" />
                  </div>
                  <div className="mt-1 h-4 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="mt-2 flex gap-1">
                    <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
                  </div>
                </div>
              </div>
              <div className="mt-3 h-8 w-full animate-pulse rounded bg-gray-200" />
            </Card>
          ))}
        </div>
      </Card>

      {/* Lista de Candidaturas */}
      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="size-5 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-44 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="size-14 animate-pulse rounded-full bg-gray-200" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
                      <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
                    </div>
                    <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                    <div className="flex gap-1">
                      {[1, 2].map((j) => (
                        <div
                          key={j}
                          className="h-5 w-24 animate-pulse rounded-full bg-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 animate-pulse rounded-lg bg-gray-200" />
                  <div className="flex gap-2">
                    <div className="size-8 animate-pulse rounded bg-gray-200" />
                    <div className="size-8 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              </div>
              <div className="mt-3 h-9 w-full animate-pulse rounded bg-gray-200" />
            </Card>
          ))}
        </div>
      </Card>
    </>
  );
}
