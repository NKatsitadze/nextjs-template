/** `"Ana Maria Smith"` → `"AM"`; falls back to `"U"` for an empty name. */
export function getInitials(name: string): string {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
  return initials || 'U';
}
