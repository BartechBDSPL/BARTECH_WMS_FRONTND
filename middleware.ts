import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { getMenuList } from '@/lib/menu-list';


export function getRouteValue(path: string): string | null {
  // console.log('getRouteValue called with path:', path);
  const menuList = getMenuList(path);
  for (const group of menuList) {
    for (const menu of group.menus) {
      if (menu.href === path) {
        // console.log('Route value found:', menu.value);
        return menu.value;
      }
      for (const submenu of menu.submenus) {
        if (submenu.href === path) {
          // console.log('Route value found in submenu:', submenu.value);
          return submenu.value;
        }
      }
    }
  }
  // console.log('No route value found for path:', path);
  return null;
}

export function middleware(request: NextRequest) {
  
  // console.log('Middleware called for path:', request.nextUrl.pathname);
  
  const loginCookie = request.cookies.get('login');
  const token = request.cookies.get('token');
  const path = request.nextUrl.pathname;



  // Allow access to login and register pages without authentication
  if (path === '/login' || path === '/register') {

    if (loginCookie?.value === 'true') {
     
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if not authenticated and trying to access other pages
  if (!loginCookie || loginCookie.value !== 'true' || !token) {
  
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect root to dashboard if authenticated
  if (path === '/') {
    // console.log('Redirecting root to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check user permissions
  try {
    // console.log('Decoding token and checking permissions');
    const decodedToken: any = jwtDecode(token.value);
    const userPermissions = decodedToken.user.Web_MenuAccess.split(',');
    // console.log('User permissions:', userPermissions);
    
    const routeValue = getRouteValue(path);
    // console.log('Route value for current path:', routeValue);

    if (routeValue && !userPermissions.includes(routeValue)) {
      // console.log('User does not have permission for this route, redirecting to unauthorized');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  } catch (error) {
    console.error('Error decoding token or checking permissions:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // console.log('Middleware check passed, proceeding to next middleware or route handler');
  return NextResponse.next();
}


export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico|manifest.json).*)']
}