"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Palette,
  Quote,
  Redo2,
  Strikethrough,
  Table2,
  Underline as UnderlineIcon,
  Undo2,
  X,
} from "lucide-react";
import { EditorContent } from "@tiptap/react";
import { useRef } from "react";
import {
  useRichTextEditor,
  type RichEditorVariant,
} from "@/components/molecules/richTextEditor.hooks";

const COLOR_SWATCHES = [
  "#111827",
  "#dc2626",
  "#ea580c",
  "#d97706",
  "#16a34a",
  "#2563eb",
  "#7c3aed",
  "#6b7280",
];

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  variant?: RichEditorVariant;
  minHeightClass?: string;
  autoFocus?: boolean;
  ariaLabel?: string;
}

function ToolButton({
  active = false,
  disabled = false,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors ${
        active
          ? "bg-orange-100 text-orange-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Share with your class",
  variant = "full",
  minHeightClass,
  autoFocus = false,
  ariaLabel = "Rich HTML text editor",
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    editor,
    linkMenuOpen,
    setLinkMenuOpen,
    linkUrl,
    setLinkUrl,
    imageMenuOpen,
    setImageMenuOpen,
    imageUrl,
    setImageUrl,
    colorMenuOpen,
    setColorMenuOpen,
    openLinkPrompt,
    applyLink,
    insertImageFromUrl,
    insertImageFromFile,
  } = useRichTextEditor({
    value,
    onChange,
    placeholder,
    variant,
    minHeightClass,
    autoFocus,
  });

  const headingLevels = variant === "comment" ? [2, 3, 4] : [1, 2, 3, 4, 5, 6];
  const activeHeading =
    headingLevels.find((lvl) => editor?.isActive("heading", { level: lvl })) ?? 0;

  return (
    <div
      aria-label={ariaLabel}
      className="relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors focus-within:border-orange-400"
    >
      {/* Fixed frappe-ui-style TipTap toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-100 bg-gray-50/80 px-2.5 py-1.5">
        <select
          aria-label="Text style"
          value={String(activeHeading)}
          disabled={!editor}
          onChange={(e) => {
            if (!editor) return;
            const lvl = Number(e.target.value);
            if (lvl === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor
                .chain()
                .focus()
                .toggleHeading({ level: lvl as 1 | 2 | 3 | 4 | 5 | 6 })
                .run();
            }
          }}
          className="mr-1 h-7 rounded-md border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700 focus:border-orange-400 focus:outline-none"
        >
          <option value="0">Paragraph</option>
          {headingLevels.map((lvl) => (
            <option key={lvl} value={String(lvl)}>
              Heading {lvl}
            </option>
          ))}
        </select>

        <span className="mx-1 h-4 w-px bg-gray-200" aria-hidden="true" />

        <ToolButton
          title="Bold"
          disabled={!editor}
          active={Boolean(editor?.isActive("bold"))}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton
          title="Italic"
          disabled={!editor}
          active={Boolean(editor?.isActive("italic"))}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton
          title="Underline"
          disabled={!editor}
          active={Boolean(editor?.isActive("underline"))}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolButton>
        {variant === "full" ? (
          <ToolButton
            title="Strikethrough"
            disabled={!editor}
            active={Boolean(editor?.isActive("strike"))}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </ToolButton>
        ) : null}

        <span className="mx-1 h-4 w-px bg-gray-200" aria-hidden="true" />

        <ToolButton
          title="Bullet List"
          disabled={!editor}
          active={Boolean(editor?.isActive("bulletList"))}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton
          title="Numbered List"
          disabled={!editor}
          active={Boolean(editor?.isActive("orderedList"))}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolButton>

        {variant === "full" ? (
          <>
            <span className="mx-1 h-4 w-px bg-gray-200" aria-hidden="true" />
            <ToolButton
              title="Align Left"
              disabled={!editor}
              active={Boolean(editor?.isActive({ textAlign: "left" }))}
              onClick={() => editor?.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </ToolButton>
            <ToolButton
              title="Align Center"
              disabled={!editor}
              active={Boolean(editor?.isActive({ textAlign: "center" }))}
              onClick={() => editor?.chain().focus().setTextAlign("center").run()}
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </ToolButton>
            <ToolButton
              title="Align Right"
              disabled={!editor}
              active={Boolean(editor?.isActive({ textAlign: "right" }))}
              onClick={() => editor?.chain().focus().setTextAlign("right").run()}
            >
              <AlignRight className="h-3.5 w-3.5" />
            </ToolButton>

            <ToolButton
              title="Font Color"
              disabled={!editor}
              active={colorMenuOpen}
              onClick={() => {
                setLinkMenuOpen(false);
                setImageMenuOpen(false);
                setColorMenuOpen((p) => !p);
              }}
            >
              <Palette className="h-3.5 w-3.5" />
            </ToolButton>
          </>
        ) : null}

        <span className="mx-1 h-4 w-px bg-gray-200" aria-hidden="true" />

        <ToolButton
          title="Insert Link"
          disabled={!editor}
          active={Boolean(editor?.isActive("link")) || linkMenuOpen}
          onClick={() => editor && openLinkPrompt(editor)}
        >
          <Link2 className="h-3.5 w-3.5" />
        </ToolButton>

        <ToolButton
          title="Insert Image"
          disabled={!editor}
          active={imageMenuOpen}
          onClick={() => {
            setLinkMenuOpen(false);
            setColorMenuOpen(false);
            setImageMenuOpen((p) => !p);
          }}
        >
          <ImageIcon className="h-3.5 w-3.5" />
        </ToolButton>

        {variant === "full" ? (
          <>
            <ToolButton
              title="Blockquote"
              disabled={!editor}
              active={Boolean(editor?.isActive("blockquote"))}
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="h-3.5 w-3.5" />
            </ToolButton>
            <ToolButton
              title="Inline Code"
              disabled={!editor}
              active={Boolean(editor?.isActive("code"))}
              onClick={() => editor?.chain().focus().toggleCode().run()}
            >
              <Code className="h-3.5 w-3.5" />
            </ToolButton>
            <ToolButton
              title="Horizontal Rule"
              disabled={!editor}
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            >
              <Minus className="h-3.5 w-3.5" />
            </ToolButton>
            <ToolButton
              title="Insert Table"
              disabled={!editor}
              active={Boolean(editor?.isActive("table"))}
              onClick={() =>
                editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
              }
            >
              <Table2 className="h-3.5 w-3.5" />
            </ToolButton>

            <span className="mx-1 h-4 w-px bg-gray-200" aria-hidden="true" />
            <ToolButton
              title="Undo"
              disabled={!editor?.can().undo()}
              onClick={() => editor?.chain().focus().undo().run()}
            >
              <Undo2 className="h-3.5 w-3.5" />
            </ToolButton>
            <ToolButton
              title="Redo"
              disabled={!editor?.can().redo()}
              onClick={() => editor?.chain().focus().redo().run()}
            >
              <Redo2 className="h-3.5 w-3.5" />
            </ToolButton>
          </>
        ) : null}
      </div>

      {/* Inline popovers for Color / Link / Image */}
      {colorMenuOpen && editor ? (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-100 bg-orange-50/40 px-3 py-2">
          <span className="mr-1 text-[11px] font-semibold text-gray-500">Text color:</span>
          {COLOR_SWATCHES.map((hex) => (
            <button
              key={hex}
              type="button"
              aria-label={`Color ${hex}`}
              onClick={() => {
                editor.chain().focus().setColor(hex).run();
                setColorMenuOpen(false);
              }}
              className="h-5 w-5 rounded-full border border-white ring-1 ring-gray-200 transition-transform hover:scale-110"
              style={{ backgroundColor: hex }}
            />
          ))}
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().unsetColor().run();
              setColorMenuOpen(false);
            }}
            className="ml-1 rounded border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      ) : null}

      {linkMenuOpen && editor ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-orange-50/40 px-3 py-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="h-7 min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-2.5 text-xs text-gray-800 focus:border-orange-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => applyLink(editor)}
            className="h-7 rounded-md bg-orange-500 px-3 text-xs font-semibold text-white hover:bg-orange-600"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setLinkMenuOpen(false)}
            aria-label="Close link bar"
            className="text-gray-400 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {imageMenuOpen && editor ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-orange-50/40 px-3 py-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste image URL (https://...)"
            className="h-7 min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-2.5 text-xs text-gray-800 focus:border-orange-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => insertImageFromUrl(editor)}
            className="h-7 rounded-md bg-orange-500 px-3 text-xs font-semibold text-white hover:bg-orange-600"
          >
            Insert URL
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) insertImageFromFile(editor, file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-7 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setImageMenuOpen(false)}
            aria-label="Close image bar"
            className="text-gray-400 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* Table context actions when inside a table */}
      {editor?.isActive("table") ? (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-3 py-1 text-[11px] font-medium text-gray-600">
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="rounded border border-gray-200 bg-white px-2 py-0.5 hover:bg-gray-100"
          >
            + Row
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="rounded border border-gray-200 bg-white px-2 py-0.5 hover:bg-gray-100"
          >
            + Col
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="rounded border border-gray-200 bg-white px-2 py-0.5 hover:bg-gray-100"
          >
            - Row
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="rounded border border-gray-200 bg-white px-2 py-0.5 hover:bg-gray-100"
          >
            - Col
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-red-600 hover:bg-red-100"
          >
            Delete Table
          </button>
        </div>
      ) : null}

      <EditorContent editor={editor} />
    </div>
  );
}
