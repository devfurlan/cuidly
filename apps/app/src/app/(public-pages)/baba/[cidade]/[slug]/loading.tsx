/**
 * Loading skeleton for public nanny profile page
 * Route: /baba/[cidade]/[slug]
 */

import { Card } from '@/components/ui/shadcn/card';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Main Profile */}
          <div className="space-y-6 lg:col-span-2">
            {/* Profile Header Skeleton */}
            <Card className="overflow-hidden border-0 bg-white shadow-sm">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col items-start gap-6 sm:flex-row">
                  {/* Avatar Skeleton */}
                  <div className="relative mx-auto sm:mx-0">
                    <div className="size-60 animate-pulse rounded-full bg-gray-200"></div>
                  </div>

                  {/* Info Skeleton */}
                  <div className="flex-1 space-y-4 text-center sm:text-left">
                    {/* Name + Age */}
                    <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-200"></div>

                    {/* Location */}
                    <div className="h-5 w-36 animate-pulse rounded bg-gray-200"></div>

                    {/* Experience */}
                    <div className="h-5 w-44 animate-pulse rounded bg-gray-200"></div>

                    {/* Bio */}
                    <div className="mt-6 space-y-2">
                      <div className="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                      <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Availability Skeleton */}
            <Card className="border-0 shadow-sm">
              <div className="p-6">
                <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200"></div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-9 w-32 animate-pulse rounded-full bg-gray-200"
                    ></div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Specialties Skeleton */}
            <Card className="border-0 shadow-sm">
              <div className="p-6">
                <div className="mb-4 h-6 w-40 animate-pulse rounded bg-gray-200"></div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-36 animate-pulse rounded-full bg-gray-200"
                    ></div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Experience with Skeleton */}
            <Card className="border-0 shadow-sm">
              <div className="p-6">
                <div className="mb-4 h-6 w-44 animate-pulse rounded bg-gray-200"></div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-40 animate-pulse rounded-full bg-gray-200"
                    ></div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Services Skeleton */}
            <Card className="border-0 shadow-sm">
              <div className="p-6">
                <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200"></div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-5 w-40 animate-pulse rounded bg-gray-200"></div>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-6 w-full animate-pulse rounded bg-gray-200"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Sidebar Skeleton */}
          <div className="space-y-6">
            {/* CTA Card Skeleton */}
            <Card className="sticky top-16 border-0 bg-linear-to-br from-fuchsia-400 to-fuchsia-500 shadow-lg">
              <div className="p-6">
                <div className="mb-3 h-7 w-48 animate-pulse rounded bg-white/30"></div>
                <div className="mb-6 h-5 w-full animate-pulse rounded bg-white/20"></div>
                <div className="mb-3 h-12 w-full animate-pulse rounded bg-white/40"></div>
                <div className="h-9 w-full animate-pulse rounded bg-white/20"></div>
              </div>
            </Card>

            {/* Documents Card Skeleton */}
            <Card className="border-0 shadow-sm">
              <div className="p-6">
                <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200"></div>
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                        <div className="h-3 w-32 animate-pulse rounded bg-gray-200"></div>
                      </div>
                      <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
