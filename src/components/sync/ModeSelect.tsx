import { Pressable, Text, View } from "react-native";

interface ModeSelectProps {
  title: string;
  icon: string;
  accentColor: string; // hex color for the icon badge border/bg
  onSelectTogether: () => void;
  onSelectApart: () => void;
  onJoin: () => void;
  loading?: boolean;
  error?: string | null;
}

/**
 * Initial screen for Check-In or Compatibility that lets partners choose:
 * - "We're Together" → pass-the-phone flow
 * - "We're Apart" → create a sync session
 * - "Join Partner" → enter a code
 */
export function ModeSelect({
  title,
  icon,
  accentColor,
  onSelectTogether,
  onSelectApart,
  onJoin,
  loading,
  error,
}: ModeSelectProps) {
  return (
    <View className="items-center gap-8 pt-6">
      <View
        className="h-16 w-16 items-center justify-center rounded-full border"
        style={{ borderColor: `${accentColor}33`, backgroundColor: `${accentColor}1a` }}
      >
        <Text className="text-3xl">{icon}</Text>
      </View>

      <Text className="text-xl font-semibold text-text">{title}</Text>

      <Text className="max-w-xs text-center text-sm leading-relaxed text-white/50">
        How would you like to do this? You can sit together and share one
        phone, or take the assessment from different locations.
      </Text>

      {error ? (
        <View className="max-w-xs rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2.5">
          <Text className="text-center text-xs text-red-400">{error}</Text>
        </View>
      ) : null}

      <View className="w-full gap-3">
        <Pressable
          onPress={onSelectTogether}
          className="flex-row items-center justify-between rounded-2xl border border-border bg-white/5 p-5 active:bg-white/[0.07]"
        >
          <View>
            <Text className="text-sm font-semibold text-text">We&apos;re Together</Text>
            <Text className="text-xs text-white/40">Share one phone, take turns</Text>
          </View>
          <Text className="text-lg">📱</Text>
        </Pressable>

        <Pressable
          onPress={onSelectApart}
          disabled={loading}
          className="flex-row items-center justify-between rounded-2xl border border-border bg-white/5 p-5 active:bg-white/[0.07] disabled:opacity-40"
        >
          <View>
            <Text className="text-sm font-semibold text-text">We&apos;re Apart</Text>
            <Text className="text-xs text-white/40">
              {loading ? "Creating session…" : "Get a code to share with your partner"}
            </Text>
          </View>
          <Text className="text-lg">🔗</Text>
        </Pressable>

        <Pressable
          onPress={onJoin}
          className="flex-row items-center justify-between rounded-2xl border border-border bg-white/5 p-5 active:bg-white/[0.07]"
        >
          <View>
            <Text className="text-sm font-semibold text-text">Join Partner</Text>
            <Text className="text-xs text-white/40">I have a code from my partner</Text>
          </View>
          <Text className="text-lg">🔑</Text>
        </Pressable>
      </View>
    </View>
  );
}
