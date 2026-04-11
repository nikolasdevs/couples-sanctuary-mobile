import { create } from "zustand";
import {
  apiGetMe,
  apiLogin,
  apiLogout,
  apiSignup,
  apiCreateInvite,
  apiJoinCouple,
  type User,
  type CoupleInfo,
} from "@/api/auth";
import { getToken } from "@/api/client";

interface AuthStore {
  user: User | null;
  couple: CoupleInfo | null;
  loading: boolean;
  hydrate: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  createInvite: () => Promise<{ inviteCode?: string; error?: string }>;
  joinCouple: (code: string) => Promise<string | null>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  couple: null,
  loading: true,

  hydrate: async () => {
    const token = await getToken();
    if (!token) {
      set({ user: null, couple: null, loading: false });
      return;
    }
    const { data } = await apiGetMe();
    if (data) {
      set({ user: data.user, couple: data.couple, loading: false });
    } else {
      set({ user: null, couple: null, loading: false });
    }
  },

  signup: async (email, password, name) => {
    const { data, error } = await apiSignup(email, password, name);
    if (error) return error;
    if (data) set({ user: data.user });
    // Fetch couple info
    const me = await apiGetMe();
    if (me.data) set({ couple: me.data.couple });
    return null;
  },

  login: async (email, password) => {
    const { data, error } = await apiLogin(email, password);
    if (error) return error;
    if (data) set({ user: data.user });
    const me = await apiGetMe();
    if (me.data) set({ couple: me.data.couple });
    return null;
  },

  logout: async () => {
    await apiLogout();
    set({ user: null, couple: null });
  },

  createInvite: async () => {
    const { data, error } = await apiCreateInvite();
    if (error) return { error };
    if (data) {
      // Refresh couple info
      const me = await apiGetMe();
      if (me.data) set({ couple: me.data.couple });
      return { inviteCode: data.inviteCode };
    }
    return { error: "Unknown error" };
  },

  joinCouple: async (code) => {
    const { error } = await apiJoinCouple(code);
    if (error) return error;
    const me = await apiGetMe();
    if (me.data) set({ couple: me.data.couple });
    return null;
  },
}));
