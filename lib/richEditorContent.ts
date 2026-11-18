/** Empty editor paragraphs (`<p></p>`) are not content; text and embedded media are. */
export function hasEditorContent(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }
  if (/<(?:img|video|audio|iframe|object|embed|table|hr)\b/i.test(value)) {
    return true;
  }
  return (
    value
      .replace(/<[^>]*>/g, "")
      .replace(/&(?:nbsp|#160|#x0*a0);/gi, " ")
      .trim().length > 0
  );
}

/** Strips HTML tags cleanly for plain-text previews and search filters. */
export function stripHtmlToText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:nbsp|#160|#x0*a0);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
