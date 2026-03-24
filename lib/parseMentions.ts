/**
 * Extracts unique MongoDB user ID strings from TipTap mention nodes in HTML.
 * TipTap renders mentions as:
 *   <span data-type="mention" data-id="userId" data-label="name">@name</span>
 */
export function parseMentionIds(html: string): string[] {
  const ids: string[] = [];
 
  // Handle both attribute orderings TipTap may produce
  const patterns = [
    /<[^>]+data-type="mention"[^>]*data-id="([^"]+)"[^>]*>/g,
    /<[^>]+data-id="([^"]+)"[^>]*data-type="mention"[^>]*>/g,
  ];
 
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      ids.push(match[1]);
    }
  }
 
  return [...new Set(ids)];
}
 