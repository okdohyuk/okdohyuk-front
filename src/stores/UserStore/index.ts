import { action, makeObservable, observable, runInAction } from 'mobx';
import { UserStoreState } from './type';
import { authApi } from '@api';
import { User } from '@api/User';
import Cookies from 'js-cookie';
import UserTokenUtil from '@utils/userTokenUtil';

class UserStore implements UserStoreState {
  @observable public user: User | null = null;

  constructor() {
    makeObservable(this);

    this.fetchCurrentUser(); // 애플리케이션 시작 시 사용자 정보 가져오기
  }

  @action public async fetchCurrentUser() {
    const userInfo = UserTokenUtil.getUserInfo();
    runInAction(() => {
      this.user = userInfo;
    });
  }

  @action public setUser = (user: User | null) => {
    this.user = user;
    // 사용자 정보 쿠키에 저장
    if (user) {
      UserTokenUtil.setUserInfo(user);
    } else {
      UserTokenUtil.removeUserInfo();
    }
  };

  @action public logOut = () => {
    UserTokenUtil.removeAccessToken();
    UserTokenUtil.removeRefreshToken();
    UserTokenUtil.removeUserInfo();
    runInAction(() => {
      this.user = null;
    });
    Cookies.remove('access_token');
    this.user = null;
  };

  @action public logOutAll = () => {
    if (!this.user) return;
    const accessToken = Cookies.get('access_token');
    if (!accessToken) {
      // 액세스 토큰이 없으면 이미 로그아웃된 상태로 간주하거나, 오류 처리
      this.logOut(); // 일반 로그아웃 처리
      return;
    }
    authApi
      .deleteAuthTokenUserId('Bearer ' + accessToken, this.user.id)
      .then(() => {
        this.logOut();
      })
      .catch(() => {
        // console.error('logOutAll 중 오류 발생:', error);
        this.logOut(); // 실패 시에도 기본 로그아웃 처리
      });
  };
}

export default UserStore;
