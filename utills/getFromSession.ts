import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';

export const getUserID = () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.user.User_ID;
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    }
    return '';
  };


  export const getUserPlant = () =>{
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.user.PlantCode;
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    }
    return '';
  }

  export const getUserCompanyCode = () =>{
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.user.CompanyCode;
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    }
    return '';
  }
