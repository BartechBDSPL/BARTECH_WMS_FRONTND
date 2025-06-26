import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://15.206.183.202:4251' ;
export const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY ||'bdspl';
export const ITEMS_PER_PAGE = 5;
export const originalKey = process.env.NEXT_PUBLIC_ORIGINAL_KEY ||'sblw-3hn8-sqoy19';
export const INACTIVITY_TIMEOUT = 15 * 60 * 1000;       




export default function getUserID() {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.user.User_ID;
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    }
    return 'Guest';
};
export function getUserDetails(value: string) {
  const token = Cookies.get('token');
  if (token) {
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.user?.[value] ?? 'Guest';
    } catch (e) {
      console.error("Failed to decode token:", e);
    }
  }
  return 'Guest';
}
export function getHeaderToken() {
    const token = Cookies.get('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }
  
  
  
  export const getBasicToken = ()=>{
    const token = Cookies.get('token');
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    } ;
  }