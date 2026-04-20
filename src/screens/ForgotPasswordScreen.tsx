import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/AuthStack";

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "ForgotPassword">;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    const err = await forgotPassword(email);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-sanctuary-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-8">
            <Pressable onPress={() => navigation.goBack()}>
              <Text className="text-zinc-500 text-xs tracking-widest uppercase mb-8">
                ← Back
              </Text>
            </Pressable>

            <Text className="text-2xl font-bold text-white tracking-tight">
              Forgot password?
            </Text>
            <Text className="text-sm text-zinc-400 mt-1">
              Enter your email and we'll send you a reset link.
            </Text>

            {sent ? (
              <View className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
                <Text className="text-white font-semibold text-center">
                  Check your inbox
                </Text>
                <Text className="text-zinc-400 text-sm text-center mt-2">
                  If an account exists for {email}, you'll receive a reset link shortly.
                </Text>
                <Pressable
                  onPress={() => navigation.navigate("Login")}
                  className="mt-6"
                >
                  <Text className="text-rose-400 text-sm text-center">
                    Back to sign in
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View className="mt-6 gap-4">
                {error ? (
                  <View className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                    <Text className="text-red-400 text-sm text-center">{error}</Text>
                  </View>
                ) : null}

                <View>
                  <Text className="text-xs text-zinc-400 font-medium mb-1.5">
                    Email
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="#52525b"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm"
                  />
                </View>

                <Pressable
                  onPress={handleSubmit}
                  disabled={loading || !email}
                  className="w-full bg-rose-600 rounded-full py-3.5 mt-2 active:opacity-80 disabled:opacity-50"
                >
                  <Text className="text-white text-center text-sm font-semibold">
                    {loading ? "Sending…" : "Send Reset Link"}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
