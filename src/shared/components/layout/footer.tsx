import { APP_NAME } from '@/shared/constants/app';
import { displayVersion } from '@/shared/lib/version';

export const Footer = () => {
  return (
    <footer className="border-t border-border px-6 py-6 sm:px-10">
      <p className="text-center text-xs text-muted-foreground">
        {APP_NAME} · {displayVersion}
      </p>
    </footer>
  );
};
