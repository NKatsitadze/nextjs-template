'use client';

import { Triangle } from 'lucide-react';
import Link from 'next/link';

import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { ThemeToggle } from '@/shared/components/layout/theme-toggle';
import { UserMenu } from '@/shared/components/layout/user-menu';
import { Button } from '@/shared/components/ui/button';
import { APP_NAME } from '@/shared/constants/app';
import { DEFAULT_AUTHENTICATED_ROUTE, HOME_ROUTE, SIGN_IN_ROUTE, SIGN_UP_ROUTE } from '@/shared/constants/routes';

export const Header = () => {
  const { user } = useAuthStore();

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-5 sm:px-10">
      <Link href={HOME_ROUTE} className="flex items-center gap-2.5">
        <span aria-hidden="true" className="inline-flex size-7 items-center justify-center rounded-md bg-foreground text-background">
          <Triangle className="size-3 fill-current" />
        </span>
        <span className="text-sm font-semibold tracking-tight text-foreground">{APP_NAME}</span>
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user ? (
          <>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:bg-accent hover:text-foreground">
              <Link href={DEFAULT_AUTHENTICATED_ROUTE}>Dashboard</Link>
            </Button>
            <UserMenu />
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:bg-accent hover:text-foreground">
              <Link href={SIGN_IN_ROUTE}>Sign in</Link>
            </Button>
            <Button size="sm" asChild className="font-semibold">
              <Link href={SIGN_UP_ROUTE}>Sign up</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
