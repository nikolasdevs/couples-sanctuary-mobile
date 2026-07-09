import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useLocalSearchParams, useRouter } from "expo-router";

import { apiFetch, ApiError } from "@/lib/apiClient";
import { AuthTextField } from "@/components/AuthTextField";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) router.replace("/forgot-password");
  }, [token, router]);

  if (!token) return null;

  const handleSubmit = async () => {
    setError("");

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        auth: false,
        body: { token, password },
      });
      setDone(true);
      setTimeout(() => router.replace("/dashboard"), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
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
          <Text className="text-2xl font-semibold tracking-tight text-text">
            Set new password
          </Text>
          <Text className="mt-2 text-sm text-muted">
            Choose a strong password for your account.
          </Text>

          {done ? (
            <View className="mt-8 w-full rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
              <Text className="text-center text-sm text-emerald-400">
                Password updated! Redirecting you to your Sanctuary…
              </Text>
            </View>
          ) : (
            <View className="mt-6 w-full gap-4">
              {error ? (
                <View className="w-full rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5">
                  <Text className="text-center text-sm text-red-400">{error}</Text>
                </View>
              ) : null}

              <AuthTextField
                label="New password"
                value={password}
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                secureTextEntry
                autoComplete="new-password"
              />
              <AuthTextField
                label="Confirm password"
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Repeat your password"
                secureTextEntry
                autoComplete="new-password"
              />

              <PrimaryButton
                label="Update Password"
                loadingLabel="Updating…"
                loading={loading}
                onPress={handleSubmit}
              />
            </View>
          )}

          <Text className="mt-6 text-center text-sm text-muted">
            <Link href="/login" className="text-accent">
              Back to sign in
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
