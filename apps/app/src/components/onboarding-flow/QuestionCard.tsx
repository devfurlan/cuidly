'use client';

import { ReactNode } from 'react';

interface QuestionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function QuestionCard({
  title,
  subtitle,
  children,
}: QuestionCardProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              {subtitle}
            </p>
          )}
        </div>

        {/* Input Area */}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
