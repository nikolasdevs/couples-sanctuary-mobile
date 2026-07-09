import { useCallback, useEffect, useState } from "react";
import { Pressable, Share, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";

interface WaitingRoomProps {
  code: string;
  partnerLabel: string; // "A" or "B"
  accentColor: string; // hex color for the icon badge
  onPartnerDone: () => void;
  pollFn: () => Promise<boolean>; // should return true when partner has completed
}

/**
 * Waiting screen while the remote partner completes their assessment.
 * Shows the sync code and polls for completion.
 */
export function WaitingRoom({
  code,
  partnerLabel,
  accentColor,
  onPartnerDone,
  pollFn,
}: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);
  const [dots, setDots] = useState("");

  // Animated dots
  useEffect(() => {
    const t = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 600);
    return () => clearInterval(t);
  }, []);

  // Poll for partner completion
  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      while (!cancelled) {
        try {
          const done = await pollFn();
          if (done && !cancelled) {
            onPartnerDone();
            return;
          }
        } catch {
          // Silently retry
        }
        await new Promise((r) => setTimeout(r, 8000));
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [pollFn, onPartnerDone]);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Use code ${code} to join our session on Couples Sanctuary`,
      });
    } catch {
      // Share dismissed
    }
  }, [code]);

  return (
    <View className="items-center gap-6 pt-6">
      <View
        className="h-20 w-20 items-center justify-center rounded-full border"
        style={{ borderColor: `${accentColor}33`, backgroundColor: `${accentColor}1a` }}
      >
        <Text className="text-4xl">📡</Text>
      </View>

      <Text className="text-lg font-semibold text-text">
        Waiting for your partner{dots}
      </Text>

      <Text className="max-w-xs text-center text-sm leading-relaxed text-white/50">
        You&apos;ve completed your part as Partner {partnerLabel}. Share this
        code with your partner so they can answer from their device.
      </Text>

      <View className="items-center gap-3">
        <View className="rounded-xl border border-border bg-white/5 px-6 py-4">
          <Text className="font-mono text-3xl tracking-[8px] text-text">{code}</Text>
        </View>

        <View className="flex-row gap-3">
          <Pressable
            onPress={handleCopy}
            className="rounded-lg border border-border bg-white/5 px-4 py-2 active:bg-white/[0.08]"
          >
            <Text className="text-xs text-white/60">{copied ? "Copied ✓" : "Copy Code"}</Text>
          </Pressable>
          <Pressable
            onPress={handleShare}
            className="rounded-lg border border-border bg-white/5 px-4 py-2 active:bg-white/[0.08]"
          >
            <Text className="text-xs text-white/60">Share Code</Text>
          </Pressable>
        </View>
      </View>

      <Text className="max-w-xs text-center text-xs text-white/30">
        This code expires in 48 hours. Results will appear automatically once
        your partner finishes.
      </Text>
    </View>
  );
}
