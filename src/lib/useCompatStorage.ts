import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import type { CompatResponses, CompatResult } from "./compatScoring";

const RESULT_KEY = "cs:compat:result";
const RESPONSES_KEY = "cs:compat:responses";

export function useCompatStorage() {
  const [result, setResult] = useState<CompatResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(RESULT_KEY);
        if (raw) setResult(JSON.parse(raw));
      } catch {
        // ignore
      }
      setReady(true);
    })();
  }, []);

  /** Get in-progress responses */
  const getResponses = useCallback(async (): Promise<{
    partnerA: CompatResponses | null;
    partnerB: CompatResponses | null;
  }> => {
    try {
      const raw = await AsyncStorage.getItem(RESPONSES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return { partnerA: null, partnerB: null };
  }, []);

  /** Save a partner's responses */
  const savePartnerResponses = useCallback(
    async (partner: "A" | "B", responses: CompatResponses) => {
      const current = await getResponses();
      if (partner === "A") current.partnerA = responses;
      else current.partnerB = responses;
      try {
        await AsyncStorage.setItem(RESPONSES_KEY, JSON.stringify(current));
      } catch {
        // ignore
      }
    },
    [getResponses],
  );

  /** Save completed result */
  const saveResult = useCallback((res: CompatResult) => {
    setResult(res);
    AsyncStorage.setItem(RESULT_KEY, JSON.stringify(res)).catch(() => {});
  }, []);

  /** Reset everything (retake assessment) */
  const reset = useCallback(() => {
    setResult(null);
    AsyncStorage.multiRemove([RESULT_KEY, RESPONSES_KEY]).catch(() => {});
  }, []);

  return { result, ready, getResponses, savePartnerResponses, saveResult, reset };
}
