import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import { useAuthStore } from "@/store/authStore";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Pair">;
};

export default function PairScreen({ navigation }: Props) {
  const { createInvite, joinCouple } = useAuthStore();

  const [mode, setMode] = useState<"choose" | "invite" | "join">("choose");
  const [inviteCode, setInviteCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleCreateInvite = async () => {
    setBusy(true);
    setError("");
    const result = await createInvite();
    if (result.error) {
      setError(result.error);
    } else if (result.inviteCode) {
      setInviteCode(result.inviteCode);
      setMode("invite");
    }
    setBusy(false);
  };

  const handleJoin = async () => {
    setBusy(true);
    setError("");
    const err = await joinCouple(joinCode);
    if (err) {
      setError(err);
      setBusy(false);
    } else {
      navigation.replace("Main");
    }
  };

  const copyCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert("Copied!", "Share this code with your partner.");
  };

  return (
    <SafeAreaView className="flex-1 bg-sanctuary-bg">
      <View className="flex-1 justify-center px-8">
        <Text className="text-2xl font-bold text-white text-center tracking-tight">
          Connect with{"\n"}your partner
        </Text>
        <Text className="text-sm text-zinc-400 text-center mt-2">
          The Sanctuary is built for two. Pair up to begin.
        </Text>

        {error ? (
          <View className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <Text className="text-red-400 text-sm text-center">{error}</Text>
          </View>
        ) : null}

        {/* ─── CHOOSE ─── */}
        {mode === "choose" && (
          <View className="mt-8 gap-3">
            <Pressable
              onPress={handleCreateInvite}
              disabled={busy}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 active:opacity-80 disabled:opacity-50"
            >
              <Text className="text-base font-semibold text-white">
                Invite my partner
              </Text>
              <Text className="text-sm text-zinc-400 mt-1">
                Generate a code and share it
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode("join")}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 active:opacity-80"
            >
              <Text className="text-base font-semibold text-white">
                I have a code
              </Text>
              <Text className="text-sm text-zinc-400 mt-1">
                My partner already sent me one
              </Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.replace("Main")}
              className="mt-2"
            >
              <Text className="text-sm text-zinc-500 text-center">
                Skip for now →
              </Text>
            </Pressable>
          </View>
        )}

        {/* ─── INVITE ─── */}
        {mode === "invite" && (
          <View className="mt-8">
            <View className="rounded-2xl border border-white/10 bg-white/5 p-6 items-center">
              <Text className="text-xs uppercase tracking-widest text-zinc-500">
                Share this code
              </Text>
              <Text className="text-3xl font-bold text-white tracking-[8px] mt-3">
                {inviteCode}
              </Text>
              <Pressable
                onPress={copyCode}
                className="mt-4 border border-white/10 rounded-full px-5 py-2 active:opacity-80"
              >
                <Text className="text-sm text-zinc-300">Copy code</Text>
              </Pressable>
            </View>

            <Text className="text-sm text-zinc-500 text-center mt-4">
              Your partner enters this code to connect.
            </Text>

            <Pressable
              onPress={() => navigation.replace("Main")}
              className="mt-6"
            >
              <Text className="text-sm text-zinc-500 text-center">
                Continue to Dashboard →
              </Text>
            </Pressable>
          </View>
        )}

        {/* ─── JOIN ─── */}
        {mode === "join" && (
          <View className="mt-8">
            <Text className="text-xs text-zinc-400 font-medium mb-1.5">
              Invite code
            </Text>
            <TextInput
              value={joinCode}
              onChangeText={(t) =>
                setJoinCode(
                  t.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6),
                )
              }
              maxLength={6}
              autoCapitalize="characters"
              placeholder="ABC123"
              placeholderTextColor="#52525b"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3.5 text-white text-xl text-center tracking-[8px] font-mono"
            />

            <Pressable
              onPress={handleJoin}
              disabled={busy || joinCode.length < 6}
              className="mt-4 bg-violet-600 rounded-full py-3.5 active:opacity-80 disabled:opacity-50"
            >
              <Text className="text-white text-center text-sm font-semibold">
                {busy ? "Joining…" : "Join Partner"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setMode("choose");
                setError("");
              }}
              className="mt-3"
            >
              <Text className="text-sm text-zinc-500 text-center">
                ← Back
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
