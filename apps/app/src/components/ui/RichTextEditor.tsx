'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import {
  PiTextB,
  PiTextItalic,
  PiListBullets,
  PiListNumbers,
} from 'react-icons/pi';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  disabled?: boolean;
}

function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 border-b bg-gray-50 px-2 py-1">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`rounded p-1.5 hover:bg-gray-200 ${
          editor.isActive('bold') ? 'bg-gray-200 text-fuchsia-600' : 'text-gray-600'
        }`}
        title="Negrito"
      >
        <PiTextB className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`rounded p-1.5 hover:bg-gray-200 ${
          editor.isActive('italic') ? 'bg-gray-200 text-fuchsia-600' : 'text-gray-600'
        }`}
        title="Itálico"
      >
        <PiTextItalic className="h-4 w-4" />
      </button>
      <div className="mx-1 h-4 w-px bg-gray-300" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`rounded p-1.5 hover:bg-gray-200 ${
          editor.isActive('bulletList') ? 'bg-gray-200 text-fuchsia-600' : 'text-gray-600'
        }`}
        title="Lista com marcadores"
      >
        <PiListBullets className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`rounded p-1.5 hover:bg-gray-200 ${
          editor.isActive('orderedList') ? 'bg-gray-200 text-fuchsia-600' : 'text-gray-600'
        }`}
        title="Lista numerada"
      >
        <PiListNumbers className="h-4 w-4" />
      </button>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  disabled,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
      }),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[200px] px-3 py-2 focus:outline-none',
      },
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div
      className={`overflow-hidden rounded-md border focus-within:ring-2 focus-within:ring-fuchsia-500 focus-within:ring-offset-1 ${
        disabled ? 'bg-gray-100 opacity-60' : 'bg-white'
      } ${className}`}
    >
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        placeholder={placeholder}
      />
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        .ProseMirror strong {
          font-weight: 600;
        }
        .ProseMirror em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

// Helper to get plain text length from HTML
export function getPlainTextLength(html: string): number {
  if (typeof window === 'undefined') return 0;
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || div.innerText || '').length;
}
