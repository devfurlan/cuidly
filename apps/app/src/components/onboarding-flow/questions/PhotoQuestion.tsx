'use client';

import { ProfilePhotoUpload } from '@/components/profile/profile-photo-upload';
import type { FlowQuestion } from '../FlowProvider';

interface PhotoQuestionProps {
  question: FlowQuestion;
  value?: string | null;
  onChange: (value: string | null) => void;
}

export function PhotoQuestion({ question, value, onChange }: PhotoQuestionProps) {
  const handlePhotoChange = async (photoDataUrl: string | null) => {
    if (!photoDataUrl) {
      // Remove photo
      try {
        await fetch('/api/profile/photo', { method: 'DELETE' });
        onChange(null);
      } catch (error) {
        console.error('Error removing photo:', error);
        throw error;
      }
      return;
    }

    // Upload photo
    try {
      const response = await fetch('/api/profile/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoDataUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao enviar foto');
      }

      const result = await response.json();
      onChange(result.url);
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <ProfilePhotoUpload
        currentPhotoUrl={value}
        onPhotoChange={handlePhotoChange}
        size="lg"
        enableValidation={true}
      />

      {/* Skip hint for optional */}
      {!question.required && !value && (
        <p className="text-center text-sm text-gray-500">
          Você pode pular esta etapa e adicionar a foto depois
        </p>
      )}
    </div>
  );
}
