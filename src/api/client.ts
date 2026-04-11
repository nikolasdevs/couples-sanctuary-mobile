import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://sanctuary.visit2nigeria.com";
const TOKEN_KEY = "sanctuary_token";

/** Store the JWT token securely on-device */
export async function setToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/** Authenticated fetch wrapper */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T | null; error: string | null; status: number }> {
  const token = await getToken();

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
    });

    const data = await res.json().catch(() => null);

    // Extract token from response body (login/signup return it)
    if (data && typeof data === "object" && "token" in data) {
      const bodyToken = (data as { token?: string }).token;
      if (bodyToken) {
        await setToken(bodyToken);
      }
    }

    if (!res.ok) {
      return {
        data: null,
        error: (data as { error?: string })?.error ?? `Error ${res.status}`,
        status: res.status,
      };
    }

    return { data: data as T, error: null, status: res.status };
  } catch {
    return { data: null, error: "Network error. Check your connection.", status: 0 };
  }
}
