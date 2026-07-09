import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

interface JoinPartnerProps {
  accentColor: string; // hex color for the button background
  onJoin: (code: string) => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

/**
 * Screen where Partner B enters the 6-character sync code.
 */
export function JoinPartner({
  accentColor,
  onJoin,
  onBack,
  loading,
  error,
}: JoinPartnerProps) {
  const [code, setCode] = useState("");

  const handleChange = (raw: string) => {
    setCode(raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6));
  };

  return (
    <View className="items-center gap-6 pt-8">
      <View className="h-16 w-16 items-center justify-center rounded-full border border-border bg-white/5">
        <Text className="text-3xl">🔑</Text>
      </View>

      <Text className="text-lg font-semibold text-text">Join Partner</Text>

      <Text className="max-w-xs text-center text-sm leading-relaxed text-white/50">
        Enter the 6-character code your partner shared with you.
      </Text>

      <TextInput
        value={code}
        onChangeText={handleChange}
        placeholder="XXXXXX"
        placeholderTextColor="rgba(255,255,255,0.2)"
        maxLength={6}
        autoCapitalize="characters"
        autoComplete="off"
        className="w-48 rounded-xl border border-border bg-white/5 px-4 py-3.5 text-center font-mono text-2xl tracking-[6px] text-text"
      />

      {error ? (
        <Text className="max-w-xs text-center text-xs text-red-400">{error}</Text>
      ) : null}

      <Pressable
        onPress={() => code.length === 6 && onJoin(code)}
        disabled={code.length !== 6 || loading}
        className="rounded-full px-8 py-3 disabled:opacity-40"
        style={{ backgroundColor: accentColor }}
      >
        <Text className="text-sm font-semibold text-black">
          {loading ? "Joining…" : "Join Session"}
        </Text>
      </Pressable>

      <Pressable onPress={onBack}>
        <Text className="text-sm text-white/40 underline">← Back</Text>
      </Pressable>
    </View>
  );
}
