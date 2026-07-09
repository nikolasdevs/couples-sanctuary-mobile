import { getToken } from "./tokenStore";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Mirrors the ApiErrorBody shape returned by the Next.js backend (lib/apiError.ts).
export interface ApiErrorBody {
  error: string;
  code: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  code: string;
  errors?: Record<string, string[]>;
  status: number;

  constructor(body: ApiErrorBody, status: number) {
    super(body.error || "Request failed.");
    this.code = body.code ?? "INTERNAL_ERROR";
    this.errors = body.errors;
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Attach the stored Bearer token. Defaults to true. */
  auth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new Error(
      "EXPO_PUBLIC_API_URL is not set. Add it to mobile/.env (see .env.example).",
    );
  }

  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data as ApiErrorBody, res.status);
  }

  return data as T;
}
