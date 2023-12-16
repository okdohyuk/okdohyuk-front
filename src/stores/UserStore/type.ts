import { User } from '@api/User';

type UserStoreState = {
  user: User | null;
  setUser: (user: User) => void;
  logOut: () => void;
  logOutAll: () => void;
};

export type { UserStoreState };
