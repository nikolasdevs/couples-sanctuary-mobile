import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState, type AppStateStatus } from "react-native";

import { apiFetch, ApiError } from "@/lib/apiClient";
import { getToken, setToken, clearToken } from "@/lib/tokenStore";

interface User {
  id: number;
  email: string;
  name: string;
}

interface CoupleInfo {
  id: number;
  status: "pending" | "active";
  inviteCode: string | null;
  partnerName: string | null;
}

interface AuthState {
  user: User | null;
  couple: CoupleInfo | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signup: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error?: string }>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  createInvite: () => Promise<{ inviteCode?: string; error?: string }>;
  joinCouple: (code: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Network error.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    couple: null,
    loading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setState({ user: null, couple: null, loading: false });
        return;
      }
      const data = await apiFetch<{ user: User; couple: CoupleInfo | null }>(
        "/api/auth/me",
      );
      setState({ user: data.user, couple: data.couple, loading: false });
    } catch {
      setState({ user: null, couple: null, loading: false });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Re-validate the session when the app returns to the foreground — mobile
  // apps get backgrounded far more often than a web tab stays hidden, so a
  // long-lived token can otherwise sit stale for days between checks.
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (appState.current.match(/inactive|background/) && nextState === "active") {
          refresh();
        }
        appState.current = nextState;
      },
    );
    return () => subscription.remove();
  }, [refresh]);

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        const data = await apiFetch<{ user: User; token: string }>(
          "/api/auth/signup",
          { method: "POST", body: { email, password, name }, auth: false },
        );
        await setToken(data.token);
        setState((s) => ({ ...s, user: data.user, loading: false }));
        await refresh();
        return {};
      } catch (err) {
        return { error: errorMessage(err) };
      }
    },
    [refresh],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const data = await apiFetch<{ user: User; token: string }>(
          "/api/auth/login",
          { method: "POST", body: { email, password }, auth: false },
        );
        await setToken(data.token);
        setState((s) => ({ ...s, user: data.user, loading: false }));
        await refresh();
        return {};
      } catch (err) {
        return { error: errorMessage(err) };
      }
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    await clearToken();
    setState({ user: null, couple: null, loading: false });
  }, []);

  const createInvite = useCallback(async () => {
    try {
      const data = await apiFetch<{ inviteCode: string }>(
        "/api/couples/invite",
        { method: "POST" },
      );
      await refresh();
      return { inviteCode: data.inviteCode };
    } catch (err) {
      return { error: errorMessage(err) };
    }
  }, [refresh]);

  const joinCouple = useCallback(
    async (code: string) => {
      try {
        await apiFetch("/api/couples/join", { method: "POST", body: { code } });
        await refresh();
        return {};
      } catch (err) {
        return { error: errorMessage(err) };
      }
    },
    [refresh],
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signup,
        login,
        logout,
        refresh,
        createInvite,
        joinCouple,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
