'use client';

import { useFlow } from './FlowProvider';
import { FlowTransition } from './FlowTransition';
import { FlowProgress } from './FlowProgress';
import { FlowNavigation } from './FlowNavigation';
import { QuestionCard } from './QuestionCard';
import { QuestionRenderer } from './questions/QuestionRenderer';

export function FlowContainer() {
  const {
    currentQuestion,
    formData,
    updateField,
    goNext,
    goBack,
    isLoading,
    isSaving,
    error,
    direction,
    currentGlobalQuestion,
    totalGlobalQuestions,
    userType,
  } = useFlow();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Nenhuma pergunta disponível</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      {/* Progress */}
      <FlowProgress
        currentGlobalQuestion={currentGlobalQuestion}
        totalGlobalQuestions={totalGlobalQuestions}
        className="mb-8"
      />

      {/* Question with animation */}
      <div className="flex-1">
        <FlowTransition
          questionKey={currentQuestion.id}
          direction={direction}
        >
          <QuestionCard
            title={currentQuestion.title}
            subtitle={currentQuestion.subtitle}
          >
            <QuestionRenderer
              question={currentQuestion}
              value={formData[currentQuestion.field]}
              onChange={(value) => updateField(currentQuestion.field, value)}
              onSubmit={goNext}
              onExtraFieldChange={updateField}
              error={error}
              userType={userType}
            />
          </QuestionCard>
        </FlowTransition>
      </div>

      {/* Navigation */}
      <div className="mt-8">
        <FlowNavigation
          onBack={goBack}
          onNext={goNext}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
}
