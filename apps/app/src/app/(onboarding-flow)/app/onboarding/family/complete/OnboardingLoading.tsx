'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Importar animações JSON
import documentAnimation from '@/assets/animations/document-creation.json';
import profileAnimation from '@/assets/animations/profile-creation.json';
import searchAnimation from '@/assets/animations/search-loading.json';
import successAnimation from '@/assets/animations/success-check.json';

// Dynamic import do Lottie para evitar SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface OnboardingLoadingProps {
  jobId?: number | null;
  childName?: string;
  onComplete?: () => void;
}

interface LoadingMessage {
  text: string;
  animation: object;
  loop: boolean;
  duration: number; // Duração em ms antes de passar para próxima
}

const messages: LoadingMessage[] = [
  {
    text: 'Criando seu perfil...',
    animation: profileAnimation,
    loop: true,
    duration: 3000,
  },
  {
    text: 'Criando sua vaga...',
    animation: documentAnimation,
    loop: false,
    duration: 3000,
  },
  {
    text: 'Vaga publicada!',
    animation: successAnimation,
    loop: false,
    duration: 2500,
  },
  {
    text: 'Buscando babás perfeitas para você...',
    animation: searchAnimation,
    loop: true,
    duration: 3000, // Última mensagem também tem duração
  },
];

export default function OnboardingLoading({
  jobId,
  childName,
  onComplete,
}: OnboardingLoadingProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const isLastStep = currentStep === messages.length - 1;
  const currentMessage = messages[currentStep];

  // Personalizar última mensagem se tiver nome da criança
  const messageText =
    isLastStep && childName
      ? `Buscando babás perfeitas para ${childName}...`
      : currentMessage?.text;

  useEffect(() => {
    if (!currentMessage) return;

    const duration = currentMessage.duration;

    if (isLastStep) {
      // Última mensagem: aguardar duração + 1 segundo e redirecionar
      const redirectTimer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
        // Redirecionar para a página da vaga ou para lista de babás
        if (jobId) {
          router.push(`/app/vagas/${jobId}`);
        } else {
          router.push('/app/babas');
        }
      }, duration + 1000);

      return () => clearTimeout(redirectTimer);
    }

    // Fade out antes de mudar de step
    const fadeOutTimer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    // Próxima mensagem após fade out (400ms de transição)
    const nextStepTimer = setTimeout(() => {
      setIsVisible(true);
      setCurrentStep((prev) => prev + 1);
    }, duration + 400);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(nextStepTimer);
    };
  }, [currentStep, router, jobId, onComplete, isLastStep, currentMessage]);

  if (!currentMessage) return null;

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col items-center justify-center px-6">
      {/* Animação e Texto */}
      <div className="mx-auto flex max-w-md flex-col items-center space-y-6">
        <div
          className={`transition-opacity duration-300 ease-in-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Lottie
            animationData={currentMessage.animation}
            loop={currentMessage.loop}
            style={{ width: 200, height: 200 }}
          />
        </div>

        <p
          className={`text-center text-xl font-medium text-gray-700 transition-opacity delay-100 duration-300 ease-in-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {messageText}
        </p>
      </div>
    </div>
  );
}
