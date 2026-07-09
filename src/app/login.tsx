import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { AuthTextField } from "@/components/AuthTextField";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function LoginScreen() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [user, authLoading, router]);

  if (authLoading || user) return null;

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    const result = await login(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow items-center justify-center px-6 py-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-sm">
          <Link href="/" className="mb-8 text-xs uppercase tracking-widest text-zinc-500">
            ← Back
          </Link>

          <Text className="text-2xl font-semibold tracking-tight text-text">
            Welcome back
          </Text>
          <Text className="mt-2 text-sm text-muted">
            Sign in to your Sanctuary
          </Text>

          {error ? (
            <View className="mt-4 w-full rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5">
              <Text className="text-center text-sm text-red-400">{error}</Text>
            </View>
          ) : null}

          <View className="mt-6 w-full gap-4">
            <AuthTextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <View>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-medium text-muted">Password</Text>
                <Link href="/forgot-password" className="text-xs text-zinc-500">
                  Forgot password?
                </Link>
              </View>
              <AuthTextField
                label=""
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="current-password"
                className="mt-1.5"
              />
            </View>

            <PrimaryButton
              label="Sign In"
              loadingLabel="Signing in…"
              loading={loading}
              onPress={handleSubmit}
            />
          </View>

          <Text className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-accent">
              Create one
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
