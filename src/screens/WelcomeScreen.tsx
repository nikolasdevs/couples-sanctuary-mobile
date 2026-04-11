import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/AuthStack";

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Welcome">;
};

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-sanctuary-bg">
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-5xl mb-4">🕯️</Text>

        <Text className="text-3xl font-bold text-white text-center tracking-tight">
          The Couples{"\n"}Sanctuary
        </Text>

        <Text className="text-base text-zinc-400 text-center mt-4 leading-6 max-w-[280px]">
          A private space for two — to bond deeper, understand each other, and
          grow closer.
        </Text>

        <View className="w-full mt-12 gap-3">
          <Pressable
            onPress={() => navigation.navigate("Signup")}
            className="w-full bg-rose-600 rounded-full py-4 active:opacity-80"
          >
            <Text className="text-white text-center text-base font-semibold">
              Get Started
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Login")}
            className="w-full border border-white/10 rounded-full py-4 active:opacity-80"
          >
            <Text className="text-zinc-300 text-center text-base font-semibold">
              I have an account
            </Text>
          </Pressable>
        </View>

        <Text className="text-xs text-zinc-600 text-center mt-8">
          Nothing is saved to any server.{"\n"}This moment belongs only to the
          two of you.
        </Text>
      </View>
    </SafeAreaView>
  );
}
