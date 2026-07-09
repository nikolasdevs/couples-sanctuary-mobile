import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

import { apiFetch, ApiError } from "@/lib/apiClient";
import { AuthTextField } from "@/components/AuthTextField";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        auth: false,
        body: { email: email.trim().toLowerCase() },
      });
      setSent(true);
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
          <Link href="/login" className="mb-8 text-xs uppercase tracking-widest text-zinc-500">
            ← Back
          </Link>

          <Text className="text-2xl font-semibold tracking-tight text-text">
            Forgot password?
          </Text>
          <Text className="mt-2 text-sm text-muted">
            Enter your email and we&apos;ll send you a reset link.
          </Text>

          {sent ? (
            <View className="mt-8 w-full rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
              <Text className="text-center text-sm text-emerald-400">
                Check your inbox — if an account exists for that email, a reset
                link is on its way.
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
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <PrimaryButton
                label="Send Reset Link"
                loadingLabel="Sending…"
                loading={loading}
                onPress={handleSubmit}
              />
            </View>
          )}

          <Text className="mt-6 text-center text-sm text-muted">
            <Link href="/login" className="text-accent">
              Sign in
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
