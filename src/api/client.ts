import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://sanctuary.visit2nigeria.com";
export const TOKEN_KEY = "sanctuary_jwt";

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setStoredToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T | null; error: string | null; status: number }> {
  const token = await getStoredToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        data: null,
        error: (data as { error?: string })?.error ?? `Error ${res.status}`,
        status: res.status,
      };
    }

    return { data: data as T, error: null, status: res.status };
  } catch {
    clearTimeout(timeout);
    return { data: null, error: "Network error. Check your connection.", status: 0 };
  }
}
