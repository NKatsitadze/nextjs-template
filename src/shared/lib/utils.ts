/**
 * Merges class names and resolves Tailwind conflicts (`cn('px-2', 'px-4') === 'px-4'`).
 * Backed by shadcn's `cn` package (compiled clsx + tailwind-merge). Always import it from here.
 */
export { cn } from 'cn';
