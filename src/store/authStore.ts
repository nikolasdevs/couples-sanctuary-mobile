import { create } from "zustand";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type Unsubscribe,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import {
  apiGetMe,
  apiCreateInvite,
  apiJoinCouple,
  type User,
  type CoupleInfo,
} from "@/api/auth";
import { apiFetch } from "@/api/client";

interface AuthStore {
  user: User | null;
  couple: CoupleInfo | null;
  loading: boolean;
  /** Call once at app start to subscribe to Firebase auth changes. */
  hydrate: () => Unsubscribe;
  signup: (email: string, password: string, name: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string | null>;
  refresh: () => Promise<void>;
  createInvite: () => Promise<{ inviteCode?: string; error?: string }>;
  joinCouple: (code: string) => Promise<string | null>;
}

function firebaseErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  const map: Record<string, string> = {
    "auth/invalid-credential":     "Invalid email or password.",
    "auth/user-not-found":         "Invalid email or password.",
    "auth/wrong-password":         "Invalid email or password.",
    "auth/email-already-in-use":   "An account with this email already exists.",
    "auth/weak-password":          "Password must be at least 8 characters.",
    "auth/invalid-email":          "Invalid email address.",
    "auth/too-many-requests":      "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/user-disabled":          "This account has been disabled.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}

async function fetchMe(): Promise<{ user: User; couple: CoupleInfo | null } | null> {
  const { data } = await apiGetMe();
  return data;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  couple: null,
  loading: true,

  hydrate: () => {
    return onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        set({ user: null, couple: null, loading: false });
        return;
      }
      const me = await fetchMe();
      if (me) {
        set({ user: me.user, couple: me.couple, loading: false });
      } else {
        set({ user: null, couple: null, loading: false });
      }
    });
  },

  signup: async (email, password, name) => {
    try {
      const cred = await createUserWithEmailAndPassword(
        firebaseAuth,
        email.trim().toLowerCase(),
        password,
      );
      const idToken = await cred.user.getIdToken();

      // Provision the Postgres user record linked to this Firebase UID.
      const { data, error } = await apiFetch<{ user: User }>(
        "/api/auth/provision",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ name }),
        },
      );
      if (error) return error;
      if (data) set({ user: data.user });

      const me = await fetchMe();
      if (me) set({ couple: me.couple });
      return null;
    } catch (err) {
      return firebaseErrorMessage(err);
    }
  },

  login: async (email, password) => {
    try {
      await signInWithEmailAndPassword(
        firebaseAuth,
        email.trim().toLowerCase(),
        password,
      );
      // onAuthStateChanged fires and updates store automatically.
      return null;
    } catch (err) {
      return firebaseErrorMessage(err);
    }
  },

  logout: async () => {
    await signOut(firebaseAuth);
    // onAuthStateChanged fires and resets store automatically.
  },

  forgotPassword: async (email) => {
    try {
      await sendPasswordResetEmail(firebaseAuth, email.trim().toLowerCase());
      return null;
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      // Treat "user not found" as silent success — don't reveal if email is registered.
      if (code === "auth/user-not-found") return null;
      return firebaseErrorMessage(err);
    }
  },

  refresh: async () => {
    const me = await fetchMe();
    if (me) {
      set({ user: me.user, couple: me.couple });
    }
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
