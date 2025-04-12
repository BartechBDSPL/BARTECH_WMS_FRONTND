'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/providers/session-provider';
import { getMenuList } from '@/lib/menu-list';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function getRouteValue(path: string | null): string | null {
  if (!path) return null;
  const menuList = getMenuList(path);
  for (const group of menuList) {
    for (const menu of group.menus) {
      if (menu.href === path) {
        return menu.value;
      }
      for (const submenu of menu.submenus) {
        if (submenu.href === path) {
          return submenu.value;
        }
      }
    }
  }
  return null;
}

function getFirstAccessibleRoute(userPermissions: string[]): string {
  const menuList = getMenuList('/');
  for (const group of menuList) {
    for (const menu of group.menus) {
      if (userPermissions.includes(menu.value)) {
        return menu.href;
      }
      for (const submenu of menu.submenus) {
        if (userPermissions.includes(submenu.value)) {
          return submenu.href;
        }
      }
    }
  }
  return '/unauthorized';
}
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      const routeValue = getRouteValue(pathname);
      if (routeValue && !user.Web_MenuAccess.includes(routeValue)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [loading, user, pathname, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
