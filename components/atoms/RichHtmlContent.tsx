"use client";

import DOMPurify from "isomorphic-dompurify";
import { useMemo } from "react";

interface RichHtmlContentProps {
  html: string;
  className?: string;
}

export const RICH_PROSE_CLASSES = [
  "text-sm leading-relaxed text-gray-700 break-words",
  "[&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-gray-900",
  "[&_h2]:mb-1.5 [&_h2]:mt-2.5 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-900",
  "[&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-900",
  "[&_h4]:mb-1 [&_h4]:mt-2 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-gray-900",
  "[&_p]:mb-1.5 last:[&_p]:mb-0",
  "[&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5",
  "[&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5",
  "[&_li]:my-0.5",
  "[&_blockquote]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-orange-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-gray-600",
  "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-gray-900 [&_pre]:p-3 [&_pre]:text-xs [&_pre]:text-gray-100",
  "[&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-orange-700",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-gray-100",
  "[&_a]:font-medium [&_a]:text-orange-600 [&_a]:underline hover:[&_a]:text-orange-700",
  "[&_img]:my-2 [&_img]:max-h-96 [&_img]:max-w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-gray-200",
  "[&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs",
  "[&_th]:border [&_th]:border-gray-200 [&_th]:bg-gray-50 [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold",
  "[&_td]:border [&_td]:border-gray-200 [&_td]:px-2.5 [&_td]:py-1.5",
  "[&_hr]:my-3 [&_hr]:border-gray-200",
].join(" ");

export function RichHtmlContent({ html, className = "" }: RichHtmlContentProps) {
  const isHtml = useMemo(() => /<[a-z][\s\S]*>/i.test(html || ""), [html]);

  const sanitized = useMemo(() => {
    if (!html || !isHtml) return "";
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "p",
        "br",
        "strong",
        "b",
        "em",
        "i",
        "u",
        "s",
        "ul",
        "ol",
        "li",
        "blockquote",
        "pre",
        "code",
        "a",
        "img",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "hr",
        "span",
        "div",
      ],
      ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "style", "class", "colspan", "rowspan"],
    });
  }, [html, isHtml]);

  if (!html) return null;

  if (!isHtml) {
    return <p className={`whitespace-pre-wrap text-sm leading-relaxed text-gray-700 ${className}`}>{html}</p>;
  }

  return (
    <div
      className={`${RICH_PROSE_CLASSES} ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
