import { type FeatureCard, type HomeStat } from '@/features/marketing/types/home';

export const HOME_FEATURES: FeatureCard[] = [
  {
    label: 'Framework',
    title: 'Next.js 16',
    description:
      'App Router, React Server Components, and streaming built in. Ship fast on architecture that scales.',
    icon: 'layers',
  },
  {
    label: 'Auth & data',
    title: 'Sessions + MongoDB',
    description:
      'bcrypt passwords, JWT + Redis sessions with idle and absolute timeouts, MongoDB data layer. Secure by default.',
    icon: 'shield',
  },
  {
    label: 'State & UI',
    title: 'Zustand + shadcn/ui',
    description:
      'Vanilla Zustand stores via context for predictable state. shadcn/ui for a polished, accessible interface.',
    icon: 'boxes',
  },
];

export const HOME_STATS: HomeStat[] = [
  { value: 'Day 1', label: 'Auth, DB & UI ready' },
  { value: '100%', label: 'TypeScript strict' },
  { value: 'Vitest', label: 'Tests wired in' },
];
