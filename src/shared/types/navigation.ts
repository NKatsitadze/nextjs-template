import { type Route } from 'next';

export type SidebarNavItem = {
  href: Route;
  label: string;
  icon: 'dashboard' | 'notes';
};
