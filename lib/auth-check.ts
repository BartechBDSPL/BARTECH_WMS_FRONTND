import { jwtDecode } from 'jwt-decode';

export const isValidToken = (token: string | undefined): boolean => {
  if (!token) return false;
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};
