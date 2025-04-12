import { useSession } from '@/providers/session-provider';
import { getMenuList } from '@/lib/menu-list';
import { useMemo } from 'react';

export function useFilteredMenu(pathname: string) {
  const { user } = useSession();

  return useMemo(() => {
    if (!user) return [];

    const menuList = getMenuList(pathname);
    return menuList.map(group => ({
      ...group,
      menus: group.menus.filter(menu => {
        if (menu.value && !user.Web_MenuAccess.includes(menu.value)) {
          return false;
        }
        menu.submenus = menu.submenus.filter(
          submenu => !submenu.value || user.Web_MenuAccess.includes(submenu.value)
        );
        return menu.submenus.length > 0 || !menu.value || user.Web_MenuAccess.includes(menu.value);
      }),
    })).filter(group => group.menus.length > 0);
  }, [user, pathname]);
}
