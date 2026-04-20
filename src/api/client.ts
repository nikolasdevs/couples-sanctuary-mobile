import { firebaseAuth } from "@/lib/firebase";

const BASE_URL = "https://sanctuary.visit2nigeria.com";

/** Get the current Firebase ID token, or null if not signed in. */
async function getIdToken(): Promise<string | null> {
  return firebaseAuth.currentUser?.getIdToken() ?? null;
}

/** Authenticated fetch wrapper — attaches the Firebase Bearer token automatically. */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T | null; error: string | null; status: number }> {
  const token = await getIdToken();

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
