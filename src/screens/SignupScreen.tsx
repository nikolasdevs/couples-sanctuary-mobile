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
  navigation: NativeStackNavigationProp<AuthStackParamList, "Signup">;
};

export default function SignupScreen({ navigation }: Props) {
  const signup = useAuthStore((s) => s.signup);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError("");
    setLoading(true);
    const err = await signup(email.trim().toLowerCase(), password, name.trim());
    if (err) {
      setError(err);
      setLoading(false);
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
              Create your account
            </Text>
            <Text className="text-sm text-zinc-400 mt-1">
              Start your journey together
            </Text>

            {error ? (
              <View className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <Text className="text-red-400 text-sm text-center">
                  {error}
                </Text>
              </View>
            ) : null}

            <View className="mt-6 gap-4">
              <View>
                <Text className="text-xs text-zinc-400 font-medium mb-1.5">
                  Your name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Alex"
                  placeholderTextColor="#52525b"
                  autoCapitalize="words"
                  autoComplete="given-name"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm"
                />
              </View>

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

              <View>
                <Text className="text-xs text-zinc-400 font-medium mb-1.5">
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#52525b"
                  secureTextEntry
                  autoComplete="new-password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm"
                />
              </View>

              <Pressable
                onPress={handleSignup}
                disabled={loading || !name || !email || !password}
                className="w-full bg-rose-600 rounded-full py-3.5 mt-2 active:opacity-80 disabled:opacity-50"
              >
                <Text className="text-white text-center text-sm font-semibold">
                  {loading ? "Creating account…" : "Create Account"}
                </Text>
              </Pressable>
            </View>

            <Pressable onPress={() => navigation.navigate("Login")} className="mt-6">
              <Text className="text-sm text-zinc-500 text-center">
                Already have an account?{" "}
                <Text className="text-rose-400">Sign in</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
