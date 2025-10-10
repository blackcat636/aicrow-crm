import { create } from 'zustand';
import { User } from '@/interface/User';
import { removeTokens } from '@/lib/auth';

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => {
    set({ user });
  },
  logout: () => {
    removeTokens();
    set({ user: null });
  }
}));
