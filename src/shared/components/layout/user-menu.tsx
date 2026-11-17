'use client';

import { useLogout } from '@/features/auth/hooks/use-logout';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { getInitials } from '@/shared/utils/initials';

export const UserMenu = () => {
  const { user } = useAuthStore();
  const { logout } = useLogout();
  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-8 border border-border">
        <AvatarFallback className="text-xs font-semibold">{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <span className="hidden text-sm text-muted-foreground sm:block">{user.name}</span>
      <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:bg-accent hover:text-foreground">
        Sign out
      </Button>
    </div>
  );
};
