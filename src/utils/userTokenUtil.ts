import Cookies from 'js-cookie';
import { User } from '@api/User';

// 모든 토큰/유저 정보 처리는 js-cookie를 사용하여 클라이언트에서 직접 관리합니다.
const isProduction = process.env.NODE_ENV === 'production';

export default class UserTokenUtil {
  // AccessToken 읽기
  static getAccessToken() {
    const accessToken = Cookies.get('access_token');
    return accessToken ? `Bearer ${accessToken}` : '';
  }
  // AccessToken 저장
  static setAccessToken(token: string) {
    Cookies.set('access_token', token, {
      sameSite: 'strict',
      expires: 1, // 1일
      secure: isProduction,
    });
  }
  // AccessToken 삭제
  static removeAccessToken() {
    Cookies.remove('access_token');
  }
  // RefreshToken 읽기
  static getRefreshToken() {
    return Cookies.get('refresh_token') || '';
  }
  // RefreshToken 저장
  static setRefreshToken(token: string) {
    Cookies.set('refresh_token', token, {
      sameSite: 'strict',
      expires: 7, // 7일
      secure: isProduction,
    });
  }
  // RefreshToken 삭제
  static removeRefreshToken() {
    Cookies.remove('refresh_token');
  }
  // 사용자 정보 읽기
  static getUserInfo() {
    const userInfoString = Cookies.get('user_info');
    if (userInfoString) {
      try {
        return JSON.parse(userInfoString) as User;
      } catch (e) {
        console.error('user_info 쿠키 파싱 오류:', e);
        Cookies.remove('user_info');
        return null;
      }
    }
    return null;
  }
  // 사용자 정보 저장
  static setUserInfo(userInfo: object) {
    Cookies.set('user_info', JSON.stringify(userInfo), {
      sameSite: 'strict',
      expires: 7,
      secure: isProduction,
    });
  }
  // 사용자 정보 삭제
  static removeUserInfo() {
    Cookies.remove('user_info');
  }
  // Bearer 토큰 문자열 반환
  static getTokenBearer(token: string) {
    return `Bearer ${token}`;
  }
}
