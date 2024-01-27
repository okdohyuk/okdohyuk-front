import Cookies from 'js-cookie';

export default class UserTokenUtil {
  static getAccessToken() {
    const accessToken = Cookies.get('access_token');
    if (!accessToken) {
      return '';
    }
    return 'Bearer ' + accessToken;
  }
  static setAccessToken(token: string) {
    Cookies.set('access_token', token);
  }
  static removeAccessToken() {
    Cookies.remove('access_token');
  }
  static getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }
  static setRefreshToken(token: string) {
    localStorage.setItem('refresh_token', token);
  }
  static removeRefreshToken() {
    localStorage.removeItem('refresh_token');
  }
  static getTokenBearer(token: string) {
    return 'Bearer ' + token;
  }
}

export const accessToken = UserTokenUtil.getAccessToken();
