export function stripHtml(html: string) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildSearchSnippet(content: string, query: string, radius = 110) {
  const plain = stripHtml(content);

  if (!plain) {
    return "";
  }

  const lower = plain.toLowerCase();
  const target = query.toLowerCase();
  const matchIndex = lower.indexOf(target);

  if (matchIndex === -1) {
    return plain.length > radius ? `${plain.slice(0, radius).trim()}...` : plain;
  }

  const start = Math.max(0, matchIndex - Math.floor(radius / 2));
  const end = Math.min(plain.length, matchIndex + target.length + Math.floor(radius / 2));
  const snippet = plain.slice(start, end).trim();

  return `${start > 0 ? "..." : ""}${snippet}${end < plain.length ? "..." : ""}`;
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
