import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";

import { useAuth } from "@/context/AuthContext";
import { PrimaryButton } from "@/components/PrimaryButton";

type Mode = "choose" | "invite" | "join";

export default function PairScreen() {
  const { user, couple, loading, createInvite, joinCouple } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("choose");
  const [inviteCode, setInviteCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (couple?.status === "active") router.replace("/dashboard");
  }, [couple, router]);

  // If the user already has a pending invite, show it.
  useEffect(() => {
    if (couple?.status === "pending" && couple.inviteCode && mode === "choose") {
      setInviteCode(couple.inviteCode);
      setMode("invite");
    }
  }, [couple, mode]);

  if (loading || !user || couple?.status === "active") {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color="#b11226" />
      </View>
    );
  }

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
    const result = await joinCouple(joinCode);
    if (result.error) {
      setError(result.error);
      setBusy(false);
    } else {
      router.push("/dashboard");
    }
  };

  const copyCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
    <ScrollView
      className="flex-1"
      contentContainerClassName="flex-grow items-center justify-center px-6 py-10"
    >
      <View className="w-full max-w-sm">
        <Text className="text-center text-2xl font-semibold tracking-tight text-text">
          Connect with your partner
        </Text>
        <Text className="mt-2 text-center text-sm text-muted">
          The Sanctuary is built for two. Pair up to begin.
        </Text>

        {error ? (
          <View className="mt-4 w-full rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5">
            <Text className="text-center text-sm text-red-400">{error}</Text>
          </View>
        ) : null}

        {mode === "choose" && (
          <View className="mt-8 w-full gap-3">
            <Pressable
              onPress={handleCreateInvite}
              disabled={busy}
              className="w-full rounded-xl border border-border bg-white/5 p-5 active:bg-white/[0.08] disabled:opacity-50"
            >
              <Text className="text-base font-semibold text-text">
                Invite my partner
              </Text>
              <Text className="mt-1 text-sm text-muted">
                Generate a code and share it with them
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode("join")}
              className="w-full rounded-xl border border-border bg-white/5 p-5 active:bg-white/[0.08]"
            >
              <Text className="text-base font-semibold text-text">
                I have a code
              </Text>
              <Text className="mt-1 text-sm text-muted">
                My partner already sent me an invite code
              </Text>
            </Pressable>

            <Link href="/dashboard" className="mt-4 block text-center text-sm text-zinc-500">
              Skip for now →
            </Link>
          </View>
        )}

        {mode === "invite" && (
          <View className="mt-8 w-full">
            <View className="items-center rounded-xl border border-border bg-white/5 p-6">
              <Text className="text-xs uppercase tracking-widest text-zinc-500">
                Share this code with your partner
              </Text>
              <Text className="mt-3 font-mono text-3xl font-bold tracking-[6px] text-text">
                {inviteCode}
              </Text>
              <Pressable
                onPress={copyCode}
                className="mt-4 rounded-full border border-border px-5 py-2 active:bg-white/5"
              >
                <Text className="text-sm text-zinc-300">
                  {copied ? "Copied!" : "Copy code"}
                </Text>
              </Pressable>
            </View>
            <Text className="mt-4 text-center text-sm text-zinc-500">
              Once your partner enters this code, you&apos;ll be connected
              automatically.
            </Text>
            <Link href="/dashboard" className="mt-6 block text-center text-sm text-zinc-500">
              Continue to Dashboard →
            </Link>
          </View>
        )}

        {mode === "join" && (
          <View className="mt-8 w-full">
            <Text className="text-xs font-medium text-muted">Invite code</Text>
            <TextInput
              value={joinCode}
              onChangeText={(text) =>
                setJoinCode(text.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))
              }
              maxLength={6}
              autoCapitalize="characters"
              placeholder="ABC123"
              placeholderTextColor="#71717a"
              className="mt-1.5 w-full rounded-lg border border-border bg-white/5 px-4 py-3 text-center font-mono text-xl tracking-[6px] text-text"
            />
            <View className="mt-4">
              <PrimaryButton
                label="Join Partner"
                loadingLabel="Joining…"
                loading={busy}
                disabled={joinCode.length < 6}
                onPress={handleJoin}
              />
            </View>
            <Pressable
              onPress={() => {
                setMode("choose");
                setError("");
              }}
              className="mt-3"
            >
              <Text className="text-center text-sm text-zinc-500">← Back</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
