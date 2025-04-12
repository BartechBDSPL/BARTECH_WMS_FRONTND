"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Ellipsis, LogOut, LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { getMenuList } from "@/lib/menu-list";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CollapseMenuButton } from "@/components/admin-panel/collapse-menu-button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import insertAuditTrail from "@/utills/insertAudit";
import { getUserID } from "@/utills/getFromSession";
import {jwtDecode} from 'jwt-decode';

interface Submenu {
  href: string;
  label: string;
  active: boolean;
  value: string;
}

interface Menu {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus: Submenu[];
  value: string;
}

interface MenuGroup {
  groupLabel: string;
  menus: Menu[];
}

interface MenuProps {
  isOpen: boolean | undefined;
}

export function Menu({ isOpen }: MenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [filteredMenuList, setFilteredMenuList] = useState<MenuGroup[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Simply get all menus without filtering
    const fullMenuList = getMenuList(pathname || '/');
    setFilteredMenuList(fullMenuList);
  }, [pathname]);

  const handleLogout = async () => {
    try {

      Cookies.remove('login');
      router.push('/login');

      toast({
        title: "Logged out",
        description: "You have been logged out.",
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-8 h-full w-full">
        <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2">
          {filteredMenuList.map(({ groupLabel, menus }, groupIndex) => (
            <li className={cn("w-full", groupLabel ? "pt-5" : "")} key={groupIndex}>
              {(isOpen && groupLabel) || isOpen === undefined ? (
                <p className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                  {groupLabel}
                </p>
              ) : !isOpen && isOpen !== undefined && groupLabel ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full">
                      <div className="w-full flex justify-center items-center">
                        <Ellipsis className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="pb-2"></p>
              )}
              {menus.map(
                ({ href, label, icon: Icon, active, submenus }, menuIndex) =>
                  submenus.length === 0 ? (
                    <div className="w-full" key={menuIndex}>
                  <TooltipProvider disableHoverableContent>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={active ? "secondary" : "ghost"}
                          className="w-full justify-start h-10 mb-1"
                          asChild
                        >
                          <Link href={href}>
                            <span className={cn(isOpen === false ? "" : "mr-4")}>
                              <Icon size={18} />
                            </span>
                            
                            <p
                              className={cn(
                                "max-w-[200px] truncate", // Keeping the original truncate behavior
                                isOpen === false
                                  ? "-translate-x-96 opacity-0"
                                  : "translate-x-0 opacity-100"
                              )}
                            >
                              {label}
                              
                            </p>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      {label.length > 21 && (
                        <TooltipContent side="right">
                          {label}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>

                  ) : (
                    <div className="w-full" key={menuIndex}>
                      <CollapseMenuButton
                        icon={Icon}
                        label={label}
                        active={active}
                        submenus={submenus}
                        isOpen={isOpen}
                      />
                    </div>
                  )
              )}
            </li>
          ))}
          <li className="w-full grow flex items-end">
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full justify-center h-10 mt-5"
                  >
                    <span className={cn(isOpen === false ? "" : "mr-4")}>
                      <LogOut size={18} />
                    </span>
                    <p
                      className={cn(
                        "whitespace-nowrap",
                        isOpen === false ? "opacity-0 hidden" : "opacity-100"
                      )}
                    >
                      Log out
                    </p>
                  </Button>
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side="right">Log out</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </li>
        </ul>
      </nav>
    </ScrollArea>
  );
}

// Replace the getFilteredMenuList function with a simpler version
export function getFilteredMenuList() {
  return getMenuList('/');
}