import { useEffect, type ReactNode } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Undo2,
  Redo2,
  RemoveFormatting,
} from 'lucide-react';
import { sanitizeRichText } from '../../lib/richText';
import { cn } from '../../lib/utils';

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeightClassName?: string;
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'p-2 rounded-lg transition-colors disabled:opacity-40',
        active
          ? 'bg-evolw-accent/15 text-evolw-accent'
          : 'text-evolw-gray-600 dark:text-evolw-gray-300 hover:bg-evolw-gray-100 dark:hover:bg-white/10'
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Paste or write the role description…',
  className,
  minHeightClassName = 'min-h-[220px]',
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: sanitizeRichText(value) || '',
    editorProps: {
      attributes: {
        class: cn(
          'evolw-rich-text outline-none px-4 py-3 focus:outline-none',
          minHeightClassName
        ),
      },
      transformPastedHTML(html) {
        return sanitizeRichText(html);
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.isEmpty ? '' : sanitizeRichText(ed.getHTML());
      onChange(html);
    },
  });

  // Sync when parent resets / loads a different job for edit
  useEffect(() => {
    if (!editor) return;
    const next = sanitizeRichText(value) || '';
    const current = editor.isEmpty ? '' : sanitizeRichText(editor.getHTML());
    if (next !== current) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        'rounded-xl border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-evolw-black overflow-hidden focus-within:ring-2 focus-within:ring-evolw-accent',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-evolw-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5">
        <ToolbarButton
          label="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Subheading"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-evolw-gray-200 dark:bg-white/10 mx-1" />
        <ToolbarButton
          label="Clear formatting"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        >
          <RemoveFormatting className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
      <p className="px-4 py-2 text-xs text-evolw-gray-500 border-t border-evolw-gray-200 dark:border-white/10">
        Tip: paste from ChatGPT — bold, lists, and headings are kept.
      </p>
    </div>
  );
}
