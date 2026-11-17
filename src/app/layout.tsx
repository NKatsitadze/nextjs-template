import { Geist_Mono, Inter, Space_Grotesk } from 'next/font/google';
import { type ReactNode } from 'react';

import { SentryUserSync } from '@/features/auth/components/sentry-user-sync';
import { getSession } from '@/features/auth/service/get-session.service';
import { Toaster } from '@/shared/components/ui/sonner';
import { APP_DESCRIPTION, APP_NAME } from '@/shared/constants/app';
import { env } from '@/shared/lib/env';
import { StoreProvider } from '@/shared/providers/store-provider';
import { ThemeProvider } from '@/shared/providers/theme-provider';

import type { Metadata } from 'next';

import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(env.get().NEXT_PUBLIC_APP_URL),
    title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
    description: APP_DESCRIPTION,
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <StoreProvider initialUser={session?.user ?? null}>
            <SentryUserSync />
            {children}
            <Toaster position="top-center" richColors />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
