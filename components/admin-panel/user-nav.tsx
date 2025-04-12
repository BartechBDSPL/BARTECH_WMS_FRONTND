"use client"
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { LayoutGrid, LogOut, User2, Briefcase, Building, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "../ui/use-toast";
import { jwtDecode } from 'jwt-decode';
import { getUserID } from "@/utills/getFromSession";
import insertAuditTrail from "@/utills/insertAudit";
import { BACKEND_URL } from '@/lib/constants';

// Define the structure of your user information
interface UserInfo {
  User_ID: string;
  User_Name: string;
  User_Status: string;
  User_Role: string;
  Name: string;
  Web_MenuAccess: string;
  PlantCode: string;
  CompanyCode: string;
  LineCode: string | null;
  ImagePath?: string;

}

// Define the structure of your JWT payload
interface JwtPayload {
  user: UserInfo;
  // Add other properties that might be in your JWT payload
}

export function UserNav() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token) as JwtPayload;
        setUserInfo(decodedToken.user);
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    }
  }, []);

  const handleLogout = () => {
    insertAuditTrail({
      AppType: "Web",
      Activity: "Log Out",
      Action: `${getUserID()} Logged out`,
      NewData: "",
      OldData: "",
      Remarks: "",
      UserId: getUserID(),
      PlantCode: ""
    });
    Cookies.remove('token');
    Cookies.remove('login');
    router.push('/login');
    toast({
      title: "Logged out",
      description: "You have been logged out.",
    });
  };

  if (!userInfo) return null;
 
  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={ `${BACKEND_URL}${userInfo.ImagePath}` || '#'} alt="Avatar" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(userInfo.User_Name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Profile</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userInfo.User_Name}</p>
            <p className="text-xs leading-none text-muted-foreground">{userInfo.User_ID}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center">
              <LayoutGrid className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <User2 className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>User Profile</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={userInfo.ImagePath|| "#"} alt="Profile picture" />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {getInitials(userInfo.User_Name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{userInfo.User_Name}</h2>
                    <p className="text-sm text-muted-foreground">{userInfo.User_Role}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        User ID
                      </CardTitle>
                      <User2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userInfo.User_ID}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Company Code
                      </CardTitle>
                      <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userInfo.CompanyCode}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Plant Code
                      </CardTitle>
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userInfo.PlantCode}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Status
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userInfo.User_Status}</div>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Web Menu Access</CardTitle>
                    <CardDescription>Your current menu access level</CardDescription>
                  </CardHeader>
                  <CardContent>
           
                    <Progress max={30} value={(((userInfo.Web_MenuAccess).split(",")).length)} className="w-full" />
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}