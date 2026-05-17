import { create } from "zustand";
import {
  apiFetch,
  setStoredToken,
  clearStoredToken,
  getStoredToken,
} from "@/api/client";
import {
  apiGetMe,
  apiCreateInvite,
  apiJoinCouple,
  type User,
  type CoupleInfo,
} from "@/api/auth";

interface AuthStore {
  user: User | null;
  couple: CoupleInfo | null;
  loading: boolean;
  hydrate: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string | null>;
  refresh: () => Promise<void>;
  createInvite: () => Promise<{ inviteCode?: string; error?: string }>;
  joinCouple: (code: string) => Promise<string | null>;
}

async function fetchMe(): Promise<{ user: User; couple: CoupleInfo | null } | null> {
  const { data } = await apiGetMe();
  return data;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  couple: null,
  loading: true,

  hydrate: async () => {
    try {
      const token = await getStoredToken();
      if (!token) {
        set({ user: null, couple: null, loading: false });
        return;
      }
      const me = await fetchMe();
      if (me) {
        set({ user: me.user, couple: me.couple, loading: false });
      } else {
        await clearStoredToken();
        set({ user: null, couple: null, loading: false });
      }
    } catch {
      set({ user: null, couple: null, loading: false });
    }
  },

  signup: async (email, password, name) => {
    try {
      const { data, error } = await apiFetch<{ user: User; token: string }>(
        "/api/auth/signup",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
            name,
          }),
        },
      );
      if (error) return error;
      if (data) {
        await setStoredToken(data.token);
        const me = await fetchMe();
        if (me) set({ user: me.user, couple: me.couple });
      }
      return null;
    } catch {
      return "Something went wrong. Please try again.";
    }
  },

  login: async (email, password) => {
    try {
      const { data, error } = await apiFetch<{ user: User; token: string }>(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        },
      );
      if (error) return error;
      if (data) {
        await setStoredToken(data.token);
        const me = await fetchMe();
        if (me) set({ user: me.user, couple: me.couple });
      }
      return null;
    } catch {
      return "Something went wrong. Please try again.";
    }
  },

  logout: async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    await clearStoredToken();
    set({ user: null, couple: null });
  },

  forgotPassword: async (email) => {
    try {
      const { error } = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (error) return error;
      return null;
    } catch {
      return "Something went wrong. Please try again.";
    }
  },

  refresh: async () => {
    const me = await fetchMe();
    if (me) set({ user: me.user, couple: me.couple });
  },

  createInvite: async () => {
    const { data, error } = await apiCreateInvite();
    if (error) return { error };
    if (data) {
      const me = await fetchMe();
      if (me) set({ couple: me.couple });
      return { inviteCode: data.inviteCode };
    }
    return { error: "Unknown error" };
  },

  joinCouple: async (code) => {
    const { error } = await apiJoinCouple(code);
    if (error) return error;
    const me = await fetchMe();
    if (me) set({ couple: me.couple });
    return null;
  },
}));
