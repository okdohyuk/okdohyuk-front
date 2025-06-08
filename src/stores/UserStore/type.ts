import { User } from '@api/User';

type UserStoreState = {
  user: User | null;
  setUser: (user: User | null) => void;
  logOut: () => void;
  logOutAll: () => void;
};

export type { UserStoreState };
