"use client"
import React, { useEffect, useCallback } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import insertAuditTrail from './insertAudit';
import { getUserID } from './getFromSession';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface IdleTimerWrapperProps {
  children: React.ReactNode;
  timeout: number; // in milliseconds
}

interface JwtPayload {
  iat: number;
  exp: number;
  [key: string]: any;
}

const IdleTimerWrapper: React.FC<IdleTimerWrapperProps> = ({ children, timeout }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const isLoginPage = pathname === '/login';

  const logoutUser = useCallback(() => {
    if (!isLoginPage) {
      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Your session has expired. Redirecting to login",
      });
      
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
      
      setTimeout(() => {
        router.push('/login');
      }, 1500); // Wait for 1.5 seconds before redirecting
    }
  }, [isLoginPage, router, toast]);

  const checkTokenExpiration = useCallback(() => {
    if (!isLoginPage) {
      const token = Cookies.get('token');
      
      if (!token) {
        logoutUser();
        return;
      }
      
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        
        if (decoded.exp && decoded.exp < currentTime) {
          logoutUser();
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        logoutUser();
      }
    }
  }, [isLoginPage, logoutUser]);

  const onIdle = () => {
    logoutUser();
  };

  const { reset } = useIdleTimer({
    timeout,
    onIdle,
    disabled: isLoginPage,
  });

  useEffect(() => {
    // Reset the timer when the pathname changes (except for the login page)
    if (!isLoginPage) {
      reset();
    }
  }, [pathname, reset, isLoginPage]);

  useEffect(() => {
    // Check token expiration every 10 seconds
    const intervalId = setInterval(() => {
      checkTokenExpiration();
    }, 10000); // 10 seconds
    
    // Initial check
    checkTokenExpiration();
    
    return () => {
      clearInterval(intervalId);
    };
  }, [checkTokenExpiration]);

  return <>{children}</>;
};

export default IdleTimerWrapper;