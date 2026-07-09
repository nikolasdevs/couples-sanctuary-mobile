import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import type { CheckInResult, Responses } from "./checkinScoring";

const HISTORY_KEY = "cs:checkin:history";
const RESPONSES_KEY = "cs:checkin:responses";

export interface CheckInHistory {
  results: CheckInResult[]; // most recent first, max 12 weeks
}

export interface WeekResponses {
  weekKey: string;
  partnerA: Responses | null;
  partnerB: Responses | null;
}

export function useCheckinStorage() {
  const [history, setHistory] = useState<CheckInHistory>({ results: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        if (raw) setHistory(JSON.parse(raw));
      } catch {
        // ignore
      }
      setReady(true);
    })();
  }, []);

  /** Get in-progress responses for a specific week */
  const getWeekResponses = useCallback(async (weekKey: string): Promise<WeekResponses> => {
    try {
      const raw = await AsyncStorage.getItem(`${RESPONSES_KEY}:${weekKey}`);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return { weekKey, partnerA: null, partnerB: null };
  }, []);

  /** Save a partner's responses for the current week */
  const savePartnerResponses = useCallback(
    async (weekKey: string, partner: "A" | "B", responses: Responses) => {
      const current = await getWeekResponses(weekKey);
      if (partner === "A") current.partnerA = responses;
      else current.partnerB = responses;
      try {
        await AsyncStorage.setItem(`${RESPONSES_KEY}:${weekKey}`, JSON.stringify(current));
      } catch {
        // ignore
      }
    },
    [getWeekResponses],
  );

  /** Save a completed check-in result */
  const saveResult = useCallback((result: CheckInResult) => {
    setHistory((prev) => {
      // Replace if same week exists, otherwise prepend
      const filtered = prev.results.filter((r) => r.weekKey !== result.weekKey);
      const next: CheckInHistory = {
        results: [result, ...filtered].slice(0, 12), // keep 12 weeks max
      };
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  /** Get the latest result */
  const latestResult = history.results[0] ?? null;

  return {
    history,
    ready,
    latestResult,
    getWeekResponses,
    savePartnerResponses,
    saveResult,
  };
}
