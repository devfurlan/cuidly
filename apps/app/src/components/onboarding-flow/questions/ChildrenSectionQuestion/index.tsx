'use client';

import { Field, FieldError } from '@/components/ui/shadcn/field';
import { cn } from '@cuidly/shared';
import { useState } from 'react';
import { PiPlus } from 'react-icons/pi';
import { AddChildDialog } from './AddChildDialog';
import { AddUnbornDialog } from './AddUnbornDialog';
import { ChildCard } from './ChildCard';
import type { ChildData, ChildrenSectionQuestionProps } from './types';

export function ChildrenSectionQuestion({
  value = [],
  onChange,
  minChildren = 1,
  maxChildren = 10,
  showValidation = false,
  error,
}: ChildrenSectionQuestionProps) {
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [addUnbornOpen, setAddUnbornOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildData | null>(null);

  const children = value || [];

  const handleAddChild = (child: ChildData) => {
    if (editingChild) {
      // Update existing child
      const updatedChildren = children.map((c) => {
        const key = c.id ?? c.tempId;
        const editKey = editingChild.id ?? editingChild.tempId;
        return key === editKey ? child : c;
      });
      onChange(updatedChildren);
    } else {
      // Add new child
      onChange([...children, child]);
    }
    setEditingChild(null);
  };

  const handleEditChild = (child: ChildData) => {
    setEditingChild(child);
    if (child.unborn) {
      setAddUnbornOpen(true);
    } else {
      setAddChildOpen(true);
    }
  };

  const handleRemoveChild = (child: ChildData) => {
    const key = child.id ?? child.tempId;
    const updatedChildren = children.filter((c) => {
      const childKey = c.id ?? c.tempId;
      return childKey !== key;
    });
    onChange(updatedChildren);
  };

  const canAddMore = children.length < maxChildren;
  const hasMinimum = children.length >= minChildren;
  const showError = (showValidation && !hasMinimum) || !!error;

  return (
    <Field data-invalid={showError}>
      {/* Children List */}
      {children.length > 0 && (
        <div className="space-y-3">
          {children.map((child) => (
            <ChildCard
              key={child.id ?? child.tempId}
              child={child}
              onEdit={() => handleEditChild(child)}
              onRemove={() => handleRemoveChild(child)}
            />
          ))}
        </div>
      )}

      {/* Add Buttons */}
      {canAddMore && (
        <div className="space-y-3">
          {/* Add Child Button */}
          <button
            type="button"
            onClick={() => {
              setEditingChild(null);
              setAddChildOpen(true);
            }}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 transition-all',
              'border-gray-300 bg-gray-50/50 text-gray-600 hover:border-fuchsia-400 hover:bg-fuchsia-50/50 hover:text-fuchsia-600',
            )}
          >
            <PiPlus className="size-5" />
            <span className="font-medium">Adicionar criança</span>
          </button>

          {/* Add Unborn Link */}
          <button
            type="button"
            onClick={() => {
              setEditingChild(null);
              setAddUnbornOpen(true);
            }}
            className="mx-auto text-sm text-gray-500 underline underline-offset-2 hover:text-fuchsia-600"
          >
            Bebê a caminho?
          </button>
        </div>
      )}

      {/* Validation Error */}
      {showError && (
        <FieldError className="text-center">
          {error || 'Adicione pelo menos uma criança para continuar'}
        </FieldError>
      )}

      {/* Add Child Dialog */}
      <AddChildDialog
        open={addChildOpen}
        onOpenChange={(open) => {
          setAddChildOpen(open);
          if (!open) setEditingChild(null);
        }}
        onSave={handleAddChild}
        editingChild={editingChild?.unborn ? null : editingChild}
      />

      {/* Add Unborn Dialog */}
      <AddUnbornDialog
        open={addUnbornOpen}
        onOpenChange={(open) => {
          setAddUnbornOpen(open);
          if (!open) setEditingChild(null);
        }}
        onSave={handleAddChild}
        editingChild={editingChild?.unborn ? editingChild : null}
      />
    </Field>
  );
}

export type { ChildData, ChildrenSectionQuestionProps } from './types';
