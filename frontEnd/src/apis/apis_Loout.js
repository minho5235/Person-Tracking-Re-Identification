import { removeCookie, getCookie } from "./apis_Cookie";

export const Logout = async () => {
    const token = getCookie('ACCESS_TOKEN');

    if (token) {
      try {
        removeCookie("ACCESS_TOKEN");
        window.location.href = '/';
      } 
      
      catch (error) {
        console.error("로그아웃에 실패했습니다:", error);
      }
    }
}