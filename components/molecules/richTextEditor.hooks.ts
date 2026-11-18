"use client";

import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";
import { RICH_PROSE_CLASSES } from "@/components/atoms/RichHtmlContent";

export type RichEditorVariant = "full" | "comment";

export function useRichTextEditor(params: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  variant: RichEditorVariant;
  minHeightClass?: string;
  autoFocus?: boolean;
}) {
  const {
    value,
    onChange,
    placeholder = "Write something...",
    variant,
    minHeightClass,
    autoFocus = false,
  } = params;

  const lastEmittedRef = useRef<string>(value);
  const [, setSelectionTick] = useState(0);
  const [linkMenuOpen, setLinkMenuOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageMenuOpen, setImageMenuOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [colorMenuOpen, setColorMenuOpen] = useState(false);

  const defaultHeight = variant === "comment" ? "min-h-[5.5rem]" : "min-h-[12rem] max-h-[50vh]";
  const editorClass = `${RICH_PROSE_CLASSES} ${minHeightClass ?? defaultHeight} cursor-text overflow-y-auto px-3.5 py-3 focus:outline-none`;

  const editor = useEditor({
    immediatelyRender: false,
    autofocus: autoFocus,
    content: value || "",
    editorProps: {
      attributes: {
        class: editorClass,
      },
    },
    extensions: [
      StarterKit.configure({
        heading: {
          levels: variant === "comment" ? [2, 3, 4] : [1, 2, 3, 4, 5, 6],
        },
        link: {
          openOnClick: false,
          autolink: true,
        },
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    onUpdate({ editor: ed }) {
      const html = ed.getHTML();
      lastEmittedRef.current = html;
      onChange(html);
      setSelectionTick((t) => t + 1);
    },
    onSelectionUpdate() {
      setSelectionTick((t) => t + 1);
    },
    onTransaction() {
      setSelectionTick((t) => t + 1);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value === lastEmittedRef.current) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value || "", { emitUpdate: false });
      lastEmittedRef.current = value;
    }
  }, [editor, value]);

  function openLinkPrompt(ed: Editor) {
    const existingHref = String(ed.getAttributes("link").href ?? "");
    setLinkUrl(existingHref);
    setImageMenuOpen(false);
    setColorMenuOpen(false);
    setLinkMenuOpen((prev) => !prev);
  }

  function applyLink(ed: Editor) {
    const clean = linkUrl.trim();
    if (!clean) {
      ed.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const normalized = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
      ed.chain().focus().extendMarkRange("link").setLink({ href: normalized }).run();
    }
    setLinkMenuOpen(false);
    setLinkUrl("");
  }

  function insertImageFromUrl(ed: Editor) {
    const clean = imageUrl.trim();
    if (!clean) return;
    ed.chain().focus().setImage({ src: clean }).run();
    setImageUrl("");
    setImageMenuOpen(false);
  }

  function insertImageFromFile(ed: Editor, file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        ed.chain().focus().setImage({ src: reader.result }).run();
      }
    };
    reader.readAsDataURL(file);
    setImageMenuOpen(false);
  }

  return {
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
  };
}
