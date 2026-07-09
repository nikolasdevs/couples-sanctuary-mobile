import { useCallback, useRef, useState } from "react";

import { apiFetch, ApiError } from "./apiClient";

export interface SyncSession {
  code: string;
  type: "checkin" | "compatibility";
  weekKey?: string;
  status: "waiting" | "complete" | "expired";
  partnerA: { name: string; responses: Record<string, unknown> } | null;
  partnerB: { name: string; responses: Record<string, unknown> } | null;
}

/**
 * Client-side hook for sync operations — create, submit, poll.
 * Mirrors lib/useSync.ts from the web app; the /api/sync* routes are public,
 * so requests go out without a Bearer token.
 */
export function useSync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Create a new sync session — returns the join code */
  const createSession = useCallback(
    async (
      type: "checkin" | "compatibility",
      weekKey?: string,
    ): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<{ code: string }>("/api/sync", {
          method: "POST",
          auth: false,
          body: { type, weekKey },
        });
        return data.code;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to create session.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /** Submit responses for a partner */
  const submitResponses = useCallback(
    async (
      code: string,
      partner: "A" | "B",
      name: string,
      responses: Record<string, unknown>,
    ): Promise<{ ok: boolean; complete: boolean }> => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<{ ok: boolean; complete: boolean }>(
          `/api/sync/${encodeURIComponent(code)}/respond`,
          { method: "POST", auth: false, body: { partner, name, responses } },
        );
        return data;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to submit.");
        return { ok: false, complete: false };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /** Fetch session status once */
  const getSession = useCallback(
    async (code: string): Promise<SyncSession | null> => {
      setError(null);
      try {
        const data = await apiFetch<Omit<SyncSession, "code">>(
          `/api/sync/${encodeURIComponent(code)}`,
          { auth: false },
        );
        return { code, ...data };
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Session not found.");
        return null;
      }
    },
    [],
  );

  /** Start polling for partner completion. Calls onComplete when both are done. */
  const startPolling = useCallback(
    (code: string, onComplete: (session: SyncSession) => void) => {
      // Stop any existing poll
      if (pollRef.current) clearInterval(pollRef.current);

      pollRef.current = setInterval(async () => {
        const session = await getSession(code);
        if (!session) return;

        if (session.status === "complete" || (session.partnerA && session.partnerB)) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          onComplete(session);
        }
      }, 8000); // poll every 8 seconds
    },
    [getSession],
  );

  /** Stop polling */
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  return {
    loading,
    error,
    createSession,
    submitResponses,
    getSession,
    startPolling,
    stopPolling,
  };
}
