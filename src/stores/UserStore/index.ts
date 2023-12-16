import { action, makeObservable, observable } from 'mobx';
import { UserStoreState } from './type';
import { authApi } from '@api';
import { User } from '@api/User';
import Cookies from 'js-cookie';
import LocalStorage from '@utils/localStorage';

class UserStore implements UserStoreState {
  @observable public user: User | null = null;

  constructor() {
    makeObservable(this);
    this.getUserByStorage();
  }

  @action public getUserByStorage = () => {
    const user = LocalStorage.getItem('user');

    if (!user) return;
    this.user = JSON.parse(user);
  };

  @action public setUser = (user: User) => {
    this.user = user;
  };

  @action public logOut = () => {
    Cookies.remove('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.user = null;
  };

  @action public logOutAll = () => {
    if (!this.user) return;
    authApi
      .deleteAuthTokenUserId('Bearer ' + Cookies.get('access_token'), this.user.id)
      .then(() => {
        this.logOut();
      });
  };
}

export default UserStore;
